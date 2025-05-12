import { getOrders, mockOrders } from '../../data/ordersMock';
import { fetchOrders } from '../../services/supabaseService';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Intentar obtener datos desde Supabase primero
    try {
      const supabaseOrders = await fetchOrders();
      if (supabaseOrders && supabaseOrders.length > 0) {
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
      }
    } catch (supabaseError) {
      console.warn('Error obteniendo datos de Supabase, usando fallback:', supabaseError);
    }
    
    // Fallback a datos mock si Supabase falla
    const orders = await getOrders();
    
    return new Response(
      JSON.stringify(orders),
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
      JSON.stringify({ error: 'Error al obtener órdenes' }),
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
      !body.items && 
      !(body.orderData && body.items && Array.isArray(body.items) && body.items.length > 0)
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
    
    try {
      // Intentar crear orden en Supabase
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
      }
    } catch (supabaseError) {
      console.warn('Error creando orden en Supabase, usando fallback:', supabaseError);
    }
    
    // Fallback a datos mock si Supabase falla
    const mockOrder = {
      id: String(Date.now()), // Generar un ID único basado en timestamp
      table_number: body.table_number || 'desconocida',
      items: body.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity || 1,
        variations: item.variations || undefined
      })),
      special_instructions: body.special_instructions || undefined,
      timestamp: new Date(),
      status: 'pending' as const
    };
    
    // Añadir a la lista de órdenes mock
    mockOrders.push(mockOrder);
    
    return new Response(
      JSON.stringify(mockOrder),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
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
