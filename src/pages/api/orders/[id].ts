import { updateOrderStatus as updateMockOrderStatus } from '../../../data/ordersMock';
import { updateOrderStatus as updateSupabaseOrderStatus } from '../../../services/supabaseService';
import type { APIRoute } from 'astro';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const orderId = params.id;
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'ID de orden no especificado' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    const body = await request.json();
    const { status } = body;
    
    if (!status) {
      return new Response(
        JSON.stringify({ error: 'Estado no especificado' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Intentar actualizar en Supabase primero
    try {
      const updatedSupabaseOrder = await updateSupabaseOrderStatus(orderId, status);
      if (updatedSupabaseOrder) {
        // Importar normalizeOrder para normalizar la respuesta
        const { normalizeOrder } = await import('../../../utils/orderAdapter');
        const normalizedOrder = normalizeOrder(updatedSupabaseOrder);
        
        return new Response(
          JSON.stringify(normalizedOrder),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (supabaseError) {
      console.warn('Error actualizando orden en Supabase, usando fallback:', supabaseError);
    }
    
    // Fallback a datos mock si Supabase falla
    const updatedOrder = await updateMockOrderStatus(orderId, status);
    
    return new Response(
      JSON.stringify(updatedOrder),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar orden' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
