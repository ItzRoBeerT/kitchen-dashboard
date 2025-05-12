// Funciones para adaptar los datos de las órdenes de Supabase
import type { Order as SupabaseOrder } from '../services/supabaseService';

export type NormalizedOrder = {
  id: string;
  displayId: string;
  tableNumber: string | number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  timestamp: Date;
  items: {
    name: string;
    quantity: number;
    variations?: string;
  }[];
  specialInstructions?: string;
};

// Función para normalizar una orden de Supabase
export function normalizeOrder(order: SupabaseOrder): NormalizedOrder {
  return {
    id: order.id,
    displayId: order.order_id || `ORDER-${order.id.substring(0, 6)}`,
    tableNumber: order.table_number,
    status: order.status,
    timestamp: new Date(order.created_at),
    items: (order.items || []).map(item => ({
      name: item.name,
      quantity: item.quantity,
      variations: item.variations
    })),
    specialInstructions: order.special_instructions
  };
}
