import React, { useState, useEffect } from 'react';

// Función auxiliar para formatear la fecha
const formatDate = (date) => {
  if (!date) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return new Date(date).toLocaleDateString('es-ES', options);
};

// Función para obtener la clase CSS según el estado
const getStatusClass = (status) => {
  const statusClasses = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'preparing': 'bg-blue-100 text-blue-800',
    'ready': 'bg-green-100 text-green-800',
    'delivered': 'bg-purple-100 text-purple-800'
  };
  return statusClasses[status] || 'bg-gray-100 text-gray-800';
};

// Función para obtener texto del estado
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'preparing': 'Preparando',
    'ready': 'Listo',
    'delivered': 'Entregado'
  };
  return statusMap[status] || status;
};

// Componente principal del dashboard
export default function OrderDashboard({ initialOrders = [] }) {
  // Estado para las órdenes
  const [orders, setOrders] = useState(initialOrders.map(order => ({
    ...order,
    timestamp: new Date(order.timestamp),
    isNew: false
  })));
  
  // Estado para el filtro actual
  const [currentFilter, setCurrentFilter] = useState('all');
  
  // Estado para notificaciones
  const [notification, setNotification] = useState({ visible: false, message: '', type: 'success' });
  
  // Estado para controlar nuevos pedidos (para animaciones)
  const [newOrderIds, setNewOrderIds] = useState([]);
  
  // Estado para controlar la última actualización
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Órdenes filtradas
  const filteredOrders = currentFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === currentFilter);
    
  // Ordenar por fecha (más recientes primero)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  // Estadísticas
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };
  
  // Cargar órdenes desde la API
  const loadOrders = async (newOrderId = null) => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const rawOrders = await response.json();
        
        // Mantener el estado de "nueva orden" para animaciones
        const processedOrders = rawOrders.map(order => {
          // Convertir timestamp a objeto Date
          const processedOrder = {
            ...order,
            timestamp: new Date(order.timestamp)
          };
          
          // Si este es el ID de una orden nueva, marcarla
          if (newOrderId && order.id === newOrderId) {
            processedOrder.isNew = true;
            
            // Añadir a la lista de nuevas órdenes para animación
            if (!newOrderIds.includes(order.id)) {
              setNewOrderIds(prev => [...prev, order.id]);
              
              // Eliminar la marca de nuevo después de 10 segundos
              setTimeout(() => {
                setNewOrderIds(prev => prev.filter(id => id !== order.id));
              }, 10000);
            }
          }
          
          return processedOrder;
        });
        
        setOrders(processedOrders);
        setLastUpdate(new Date()); // Actualizamos la marca de tiempo
      }
    } catch (error) {
      console.error('Error al cargar las órdenes:', error);
      showNotification('Error al cargar las órdenes. Intente nuevamente más tarde.', 'error');
    }
  };
  
  // Actualizar estado de una orden
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        showNotification(`Orden #${updatedOrder.displayId || orderId} actualizada a ${getStatusText(newStatus)}`);
        loadOrders(); // Recargar órdenes
      } else {
        throw new Error('Error actualizando orden');
      }
    } catch (error) {
      console.error('Error al actualizar el estado de la orden:', error);
      showNotification('Error al actualizar el estado de la orden', 'error');
    }
  };
  
  // Mostrar notificación
  const showNotification = (message, type = 'success', duration = 5000) => {
    setNotification({ visible: true, message, type });
    // Auto ocultar después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
      }, duration);
    }
  };
  
  // Comprobar conexión a internet
  const checkConnection = () => {
    if (!navigator.onLine) {
      showNotification(
        'Sin conexión a Internet. Reconectando...',
        'error',
        0 // No auto-ocultar
      );
    } else {
      // Ocultar notificación de error de conexión si estaba visible
      if (notification.visible && notification.message.includes('Sin conexión')) {
        showNotification('Conexión restablecida', 'success');
        // Recargar órdenes automáticamente
        loadOrders();
      }
    }
  };
  
  // Solicitar permiso de notificaciones
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);
  
  // Configurar detectores de estado de conexión
  useEffect(() => {
    // Verificar estado inicial
    checkConnection();
    
    // Añadir detectores de eventos
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);
    
  // Configurar suscripción en tiempo real con Supabase
  useEffect(() => {
    // Carga inicial de órdenes
    loadOrders();
    
    // Comprobar nuevas órdenes con un intervalo regular (como respaldo a Supabase)
    const intervalCheck = setInterval(() => {
      loadOrders();
    }, 20000); // Comprobar cada 20 segundos (más frecuente)
    
    // También recargar cuando el usuario regrese a la página después de tenerla en segundo plano
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Usuario regresó a la página - recargando órdenes...');
        loadOrders();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Audio para notificación
    let notificationSound;
    if (typeof Audio !== 'undefined') {
      notificationSound = new Audio('/sounds/notification.aiff');
    }
    
    // Función para reproducir sonido de notificación
    const playNotificationSound = () => {
      if (notificationSound) {
        notificationSound.play().catch(error => {
          console.error('Error al reproducir sonido de notificación:', error);
        });
      }
    };
    
    // Importar supabase solo en el cliente
    import('../services/supabaseService').then(({ supabase }) => {
      // Suscripción a cambios en la tabla 'orders'
      const subscription = supabase
        .channel('orders-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          // Cuando se crea una nueva orden
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new;
            playNotificationSound();
            
            // Mostrar notificación del navegador si está permitido
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("¡Nueva comanda recibida!", {
                body: `Mesa ${newOrder.table_number} - Comanda #${newOrder.order_id}`,
                icon: "/favicon.svg"
              });
            }
            
            // Mostrar notificación en la interfaz
            showNotification(`¡Nueva comanda #${newOrder.order_id} recibida para mesa ${newOrder.table_number}!`, 'success');
            loadOrders(newOrder.id); // Recargar órdenes marcando la nueva
          }
          
          // Cuando se actualiza una orden
          if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new;
            showNotification(`Comanda #${updatedOrder.order_id} actualizada a ${getStatusText(updatedOrder.status)}`);
            loadOrders(); // Recargar órdenes
          }
          
          // Cuando se elimina una orden
          if (payload.eventType === 'DELETE') {
            loadOrders(); // Recargar órdenes
          }
        })
        .subscribe();
      
      // Limpiar suscripción y el intervalo al desmontar
      return () => {
        subscription.unsubscribe();
        clearInterval(intervalCheck);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    });
  }, []);
  
  // Eliminar una orden
  const deleteOrder = async (order) => {
    // Confirmación antes de eliminar
    if (!confirm(`¿Estás seguro de eliminar la comanda #${order.displayId}? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        showNotification(`Comanda #${order.displayId} eliminada correctamente`);
        loadOrders(); // Recargar órdenes
      } else {
        throw new Error('Error eliminando orden');
      }
    } catch (error) {
      console.error('Error al eliminar la orden:', error);
      showNotification('Error al eliminar la comanda', 'error');
    }
  };

  // Renderizar botones de acción según el estado
  const renderActionButtons = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => updateOrderStatus(order.id, 'preparing')} 
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              Preparar
            </button>
          </div>
        );
      case 'preparing':
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => updateOrderStatus(order.id, 'ready')} 
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
              Marcar Listo
            </button>
          </div>
        );
      case 'ready':
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => updateOrderStatus(order.id, 'delivered')} 
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">
              Entregar
            </button>
            <button 
              onClick={() => deleteOrder(order.id)} 
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
              Eliminar
            </button>
          </div>
        );
      case 'delivered':
        return (
          <div className="flex gap-2">
            <button 
              disabled 
              className="px-3 py-1 bg-gray-300 text-gray-500 rounded cursor-not-allowed">
              Entregada
            </button>
            <button 
              onClick={() => deleteOrder(order.id)} 
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
              Eliminar
            </button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="mb-6">
      {/* Notificaciones */}
      {notification.visible && (
        <div className={`my-4 p-3 rounded border flex justify-between ${
          notification.type === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(prev => ({ ...prev, visible: false }))}>
            &times;
          </button>
        </div>
      )}
      
      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">Estadísticas</h3>
          <div className="text-sm text-gray-500 flex items-center">
            <span>Última actualización: {formatDate(lastUpdate)}</span>
            <button 
              onClick={() => loadOrders()}
              className="ml-2 p-1 rounded-full hover:bg-gray-100"
              title="Actualizar ahora"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-3xl text-yellow-600 font-bold">{stats.pending}</div>
            <div className="text-sm text-yellow-800">Pendientes</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-3xl text-blue-600 font-bold">{stats.preparing}</div>
            <div className="text-sm text-blue-800">En preparación</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-3xl text-green-600 font-bold">{stats.ready}</div>
            <div className="text-sm text-green-800">Listas</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-3xl text-purple-600 font-bold">{stats.delivered}</div>
            <div className="text-sm text-purple-800">Entregadas</div>
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <h2 className="text-xl font-bold mb-3 sm:mb-0">Filtrar comandas:</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setCurrentFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentFilter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
              Todas
            </button>
            <button 
              onClick={() => setCurrentFilter('pending')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentFilter === 'pending' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
              Pendientes
            </button>
            <button 
              onClick={() => setCurrentFilter('preparing')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentFilter === 'preparing' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
              En preparación
            </button>
            <button 
              onClick={() => setCurrentFilter('ready')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentFilter === 'ready' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
              Listas
            </button>
            <button 
              onClick={() => setCurrentFilter('delivered')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentFilter === 'delivered' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
              Entregadas
            </button>
          </div>
        </div>
      </div>
      
      {/* Panel de comandas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedOrders.length > 0 ? (
          sortedOrders.map(order => (
            <div 
              key={order.id} 
              className={`bg-white rounded-lg shadow p-4 transition-all duration-500 ${
                newOrderIds.includes(order.id) 
                  ? 'ring-4 ring-yellow-400 animate-pulse transform hover:scale-102' 
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <h3 className="text-lg font-bold mr-2">Mesa {order.tableNumber}</h3>
                  {newOrderIds.includes(order.id) && (
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        ¡NUEVA!
                      </span>
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <ul className="mb-3">
                {order.items.map((item, index) => (
                  <li key={index} className="py-1 flex justify-between">
                    <span>{item.name} {item.variations ? `(${item.variations})` : ''}</span>
                    <span className="font-medium">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
              {order.specialInstructions && (
                <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                  <p className="font-medium">Instrucciones especiales:</p>
                  <p>{order.specialInstructions}</p>
                </div>
              )}
              <div className="border-t border-gray-200 my-2 pt-2 text-sm text-gray-500">
                <p>ID: {order.displayId}</p>
                <p>Creado: {formatDate(order.timestamp)}</p>
              </div>
              <div className="mt-3 flex justify-end space-x-2">
                {renderActionButtons(order)}
              </div>
            </div>
          ))
        ) : (
          orders.length === 0 ? (
            // No hay órdenes en absoluto
            <div className="col-span-3 text-center py-10">
              <div className="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-gray-500 text-xl mb-2">Aún no hay comandas</p>
                <p className="text-gray-400">Las comandas aparecerán aquí cuando se realicen nuevos pedidos.</p>
                <a href="/crear" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Crear comanda de prueba
                </a>
              </div>
            </div>
          ) : (
            // Hay órdenes pero ninguna coincide con el filtro
            <div className="col-span-3 text-center py-10">
              <div className="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <p className="text-gray-500 text-xl mb-2">No hay comandas que coincidan con el filtro</p>
                <p className="text-gray-400">Intente con un filtro diferente para ver más resultados.</p>
                <button 
                  onClick={() => setCurrentFilter('all')} 
                  className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                  Mostrar todas
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
