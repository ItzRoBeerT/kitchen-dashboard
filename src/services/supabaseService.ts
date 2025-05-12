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

export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    // Primero eliminamos los items relacionados (foreign key constraint)
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);
    
    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
      return false;
    }
    
    // Después eliminamos la orden
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    if (error) {
      console.error('Error deleting order:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting order:', error);
    return false;
  }
}