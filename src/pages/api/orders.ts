import { fetchOrders } from '../../services/supabaseService';
import type { APIRoute } from 'astro';

// Set this route to be server-rendered
export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Obtener datos desde Supabase
    const supabaseOrders = await fetchOrders();
    
    // Normalizar las órdenes para que el cliente tenga un formato consistente
    const { normalizeOrder } = await import('../../utils/orderAdapter');
    const normalizedOrders = supabaseOrders.map(order => normalizeOrder(order));
    
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
    console.error('Error al obtener órdenes:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener órdenes', orders: [] }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    if (
      !body.items || 
      !(body.items && Array.isArray(body.items) && body.items.length > 0)
    ) {
      return new Response(
        JSON.stringify({ error: 'Se requieren elementos en la comanda' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Crear orden en Supabase
    const { createOrder, generateOrderId } = await import('../../services/supabaseService');
    
    // Verificar si recibimos la estructura orderData o la antigua
    const orderData = body.orderData || {
      order_id: generateOrderId(),
      table_number: String(body.table_number || 'desconocida'),
      special_instructions: body.special_instructions,
      status: 'pending'
    };
    
    const items = body.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity || 1,
      variations: item.variations
    }));
    
    const newOrder = await createOrder(orderData, items);
    
    if (newOrder) {
      // Normalizar la nueva orden antes de devolverla
      const { normalizeOrder } = await import('../../utils/orderAdapter');
      const normalizedOrder = normalizeOrder(newOrder);
      
      return new Response(
        JSON.stringify(normalizedOrder),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      throw new Error('No se pudo crear la orden');
    }
  } catch (error) {
    console.error('Error al crear nueva comanda:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
