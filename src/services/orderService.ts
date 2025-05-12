import { getOrders as getMockOrders, updateOrderStatus as updateMockStatus, type Order as MockOrder } from '../data/ordersMock';
import { 
  fetchOrders, 
  updateOrderStatus as updateSupabaseOrderStatus, 
  createOrder as createSupabaseOrder,
  generateOrderId,
  type Order,
  type OrderItem
} from './supabaseService';

export class OrderService {
  static async getOrders(): Promise<Order[] | MockOrder[]> {
    try {
      // Intentar obtener órdenes desde Supabase
      const orders = await fetchOrders();
      if (orders && orders.length > 0) {
        return orders;
      }

      // Si Supabase falla, intentar obtener órdenes desde la API local
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const apiOrders = await response.json();
          return apiOrders;
        }
      } catch (apiError) {
        console.warn('API local no disponible', apiError);
      }
      
      // Último recurso: usar datos mock
      console.warn('Usando datos mock como fallback');
      return await getMockOrders();
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      return await getMockOrders();
    }
  }

  static async updateOrderStatus(id: string, status: 'pending' | 'preparing' | 'ready' | 'delivered'): Promise<Order | MockOrder | null> {
    try {
      // Intentar actualizar en Supabase
      const updatedOrder = await updateSupabaseOrderStatus(id, status);
      if (updatedOrder) {
        return updatedOrder;
      }

      // Si Supabase falla, intentar con la API local
      try {
        const response = await fetch(`/api/orders/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (apiError) {
        console.warn('API local no disponible', apiError);
      }
      
      // Último recurso: usar datos mock
      console.warn('Usando datos mock como fallback para actualizar estado');
      return await updateMockStatus(id, status);
    } catch (error) {
      console.error('Error al actualizar estado de la orden:', error);
      return null;
    }
  }
  
  static async createOrder(
    tableNumber: string | number,
    items: { name: string; quantity: number; variations?: string }[],
    specialInstructions?: string
  ): Promise<Order | MockOrder | null> {
    try {
      // Preparar datos para Supabase
      const orderId = generateOrderId();
      
      // Crear orden en Supabase
      const newOrder = await createSupabaseOrder(
        {
          order_id: orderId,
          table_number: tableNumber.toString(),
          special_instructions: specialInstructions,
          status: 'pending'
        },
        items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          variations: item.variations
        }))
      );
      
      if (newOrder) {
        return newOrder;
      }
      
      // Si Supabase falla, intentar con la API local
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            table_number: tableNumber,
            items,
            special_instructions: specialInstructions
          })
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (apiError) {
        console.warn('API local no disponible para crear orden', apiError);
      }
      
      // No hay fallback para creación, retornamos null
      console.error('No se pudo crear la orden');
      return null;
    } catch (error) {
      console.error('Error al crear nueva orden:', error);
      return null;
    }
  }
}

