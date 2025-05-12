export interface OrderItem {
  name: string;
  quantity: number;
  variations?: string;
}

export interface Order {
  id: string;
  table_number: number | "desconocida";
  items: OrderItem[];
  special_instructions?: string;
  timestamp: Date;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
}

// Datos de muestra para las comandas
export const mockOrders: Order[] = [
  {
    id: '1',
    table_number: 5,
    items: [
      { name: "Paella Valenciana", quantity: 2, variations: "Sin marisco" },
      { name: "Ensalada César", quantity: 1 },
      { name: "Agua mineral", quantity: 3 }
    ],
    special_instructions: "Cliente alérgico a los frutos de mar",
    timestamp: new Date(),
    status: 'pending'
  },
  {
    id: '2',
    table_number: 3,
    items: [
      { name: "Hamburguesa completa", quantity: 1, variations: "Término medio" },
      { name: "Patatas bravas", quantity: 1 },
      { name: "Refresco cola", quantity: 1 }
    ],
    timestamp: new Date(Date.now() - 10 * 60000), // 10 minutos antes
    status: 'preparing'
  },
  {
    id: '3',
    table_number: "desconocida",
    items: [
      { name: "Pizza Margarita", quantity: 1 },
      { name: "Tiramisú", quantity: 2 }
    ],
    special_instructions: "Para llevar",
    timestamp: new Date(Date.now() - 15 * 60000), // 15 minutos antes
    status: 'ready'
  },
  {
    id: '4',
    table_number: 8,
    items: [
      { name: "Solomillo", quantity: 2, variations: "Uno poco hecho, otro al punto" },
      { name: "Ensalada mixta", quantity: 1 },
      { name: "Botella de vino tinto", quantity: 1, variations: "Rioja Reserva" }
    ],
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutos antes
    status: 'pending'
  }
];

// Función para obtener las órdenes - Simulando API
export async function getOrders(): Promise<Order[]> {
  // Aquí iría la llamada a la API real cuando esté disponible
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockOrders), 500); // Simulamos un pequeño retraso como en una API real
  });
}

// Función para actualizar el estado de una orden - Simulando API
export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
  const order = mockOrders.find(order => order.id === id);
  if (!order) {
    throw new Error('Orden no encontrada');
  }
  
  order.status = status;
  
  // Aquí iría la llamada a la API real cuando esté disponible
  return new Promise((resolve) => {
    setTimeout(() => resolve({...order}), 300);
  });
}
