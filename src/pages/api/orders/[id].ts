import { updateOrderStatus, deleteOrder } from '../../../services/supabaseService';
import type { APIRoute } from 'astro';

// Set this route to be server-rendered
export const prerender = false;

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
    
    // Actualizar en Supabase
    const updatedOrder = await updateOrderStatus(orderId, status);
    
    if (updatedOrder) {
      // Importar normalizeOrder para normalizar la respuesta
      const { normalizeOrder } = await import('../../../utils/orderAdapter');
      const normalizedOrder = normalizeOrder(updatedOrder);
      
      return new Response(
        JSON.stringify(normalizedOrder),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      // Si no se encuentra la orden
      return new Response(
        JSON.stringify({ error: 'No se encontró la orden especificada' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
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

export const DELETE: APIRoute = async ({ params }) => {
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
    
    // Eliminar la orden en Supabase
    const success = await deleteOrder(orderId);
    
    if (success) {
      return new Response(
        JSON.stringify({ message: 'Orden eliminada correctamente' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'No se pudo eliminar la orden' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar orden' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
