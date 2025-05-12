import { 
  fetchOrders, 
  updateOrderStatus,
  createOrder as createSupabaseOrder,
  generateOrderId,
  type Order,
  type OrderItem
} from './supabaseService';

export class OrderService {
  static async getOrders(): Promise<Order[]> {
    try {
      // Obtener órdenes desde Supabase
      const orders = await fetchOrders();
      return orders;
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      throw new Error('Error al obtener órdenes');
    }
  }

  static async updateOrderStatus(id: string, status: 'pending' | 'preparing' | 'ready' | 'delivered'): Promise<Order | null> {
    try {
      // Actualizar en Supabase
      const updatedOrder = await updateOrderStatus(id, status);
      return updatedOrder;
    } catch (error) {
      console.error('Error al actualizar estado de la orden:', error);
      throw new Error('Error al actualizar estado de la orden');
    }
  }
  
  static async createOrder(
    tableNumber: string | number,
    items: { name: string; quantity: number; variations?: string }[],
    specialInstructions?: string
  ): Promise<Order | null> {
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
      
      return newOrder;
    } catch (error) {
      console.error('Error al crear nueva orden:', error);
      throw new Error('Error al crear nueva orden');
    }
  }
}

