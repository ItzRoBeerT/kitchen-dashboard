import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials are missing!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos de datos adaptados a la estructura de Supabase
export interface OrderItem {
  id?: string;
  order_id: string;
  name: string;
  quantity: number;
  variations?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_id: string;
  table_number: string;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

// Funciones para interactuar con la base de datos
export async function fetchOrders(): Promise<Order[]> {
  try {
    // Obtener todas las órdenes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }
    
    // Para cada orden, obtener sus elementos
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        if (itemsError) {
          console.error(`Error fetching items for order ${order.id}:`, itemsError);
          return { ...order, items: [] };
        }
        
        return { ...order, items: items || [] };
      })
    );
    
    return ordersWithItems;
  } catch (error) {
    console.error('Unexpected error fetching orders:', error);
    return [];
  }
}

export async function createOrder(
  orderData: {
    order_id: string;
    table_number: string;
    special_instructions?: string;
    status?: 'pending' | 'preparing' | 'ready' | 'delivered';
  },
  items: Omit<OrderItem, 'order_id' | 'id' | 'created_at'>[]
): Promise<Order | null> {
  try {
    // Insertar la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return null;
    }
    
    // Insertar los elementos de la orden
    if (items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        name: item.name,
        quantity: item.quantity,
        variations: item.variations
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // A pesar del error en los items, devolvemos la orden creada
      }
      
      // Recuperar los items creados para devolver la orden completa
      const { data: createdItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
        
      return { ...order, items: createdItems || [] };
    }
    
    return { ...order, items: [] };
  } catch (error) {
    console.error('Unexpected error creating order:', error);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'preparing' | 'ready' | 'delivered'
): Promise<Order | null> {
  try {
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order status:', error);
      return null;
    }
    
    // Obtener los items de la orden actualizada
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    return { ...updatedOrder, items: items || [] };
  } catch (error) {
    console.error('Unexpected error updating order status:', error);
    return null;
  }
}

// Función para generar un ID único para nuevas órdenes (formato OD-YYYYMMDD-XXX)
export function generateOrderId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `OD-${year}${month}${day}-${random}`;
}
