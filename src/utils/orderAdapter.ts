// Funciones para adaptar los datos de las órdenes tanto de Supabase como de los datos Mock
import type { Order as MockOrder } from '../data/ordersMock';
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

export function normalizeOrder(order: MockOrder | SupabaseOrder): NormalizedOrder {
  // Si es una orden de Supabase
  if ('created_at' in order && 'order_id' in order) {
    return {
      id: order.id,
      displayId: order.order_id,
      tableNumber: order.table_number,
      status: order.status,
      timestamp: new Date(order.created_at),
      items: order.items?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        variations: item.variations
      })) || [],
      specialInstructions: order.special_instructions
    };
  }
  
  // Si es una orden mock
  return {
    id: order.id,
    displayId: `MOCK-${order.id.substring(0, 6)}`,
    tableNumber: order.table_number,
    status: order.status,
    timestamp: new Date(order.timestamp),
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      variations: item.variations
    })),
    specialInstructions: order.special_instructions
  };
}
