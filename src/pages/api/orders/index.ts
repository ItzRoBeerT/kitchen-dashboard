import { fetchOrders } from '../../../services/supabaseService';
import { normalizeOrder } from '../../../utils/orderAdapter';
import type { APIRoute } from 'astro';

// Set this route to be server-rendered
export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Fetch orders from Supabase
    const orders = await fetchOrders();
    
    // Normalize the orders for the frontend
    const normalizedOrders = orders.map(order => normalizeOrder(order));
    
    return new Response(
      JSON.stringify(normalizedOrders),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    return new Response(
      JSON.stringify({ error: 'Error al obtener las comandas' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
