# Dashboard de Comandas para Cocina

Aplicación web desarrollada con Astro para visualizar y gestionar las comandas que llegan a la cocina de un restaurante. Integrada con Supabase para almacenamiento de datos en tiempo real.

## 📋 Características

- 📊 Panel de control con estadísticas en tiempo real
- 🧩 Filtrado de comandas por estado
- 🔄 Actualización del estado de las comandas en tiempo real
- 📡 Integración con Supabase para almacenamiento persistente
- 🔌 Suscripción a cambios en tiempo real con la base de datos
- ➕ Sistema para crear nuevas comandas 
- 🖼️ Interfaz de usuario moderna y responsive
- 🔄 Sistema de fallback a datos de prueba cuando no hay conexión

## 🚀 Estructura del Proyecto

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── OrderCard.astro    # Componente para mostrar una comanda
│   │   ├── OrderCreator.astro # Componente para crear nuevas comandas
│   │   ├── OrderFilter.astro  # Filtros para las comandas
│   │   └── OrderStats.astro   # Estadísticas de comandas
│   ├── data/
│   │   └── ordersMock.ts      # Datos de prueba y modelos de datos
│   ├── layouts/
│   │   └── Layout.astro       # Layout principal de la aplicación
│   ├── pages/
│   │   ├── api/               # Endpoints API 
│   │   │   ├── orders.ts      # GET/POST para comandas
│   │   │   └── orders/[id].ts # PUT para actualizar estados
│   │   ├── crear.astro        # Página para crear nuevas comandas
│   │   └── index.astro        # Dashboard principal
│   ├── services/
│   │   ├── orderService.ts    # Servicio para gestionar comandas
│   │   └── supabaseService.ts # Servicio para integración con Supabase
│   ├── styles/
│   │   └── global.css         # Estilos globales
│   └── utils/
│       └── orderAdapter.ts    # Adaptador para normalizar datos de diferentes fuentes
├── .env                      # Variables de entorno (Supabase URL y KEY)
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## 🔧 Configuración

Para configurar la aplicación con Supabase:

1. Crea un proyecto en [Supabase](https://supabase.io/).
2. Crea las siguientes tablas:
   - `orders`: Para almacenar las órdenes
   - `order_items`: Para los elementos de cada orden
3. Copia el archivo `.env.example` a `.env` y añade tus credenciales:
   ```
   SUPABASE_URL=tu-url-de-supabase
   SUPABASE_KEY=tu-api-key-de-supabase
   ```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 💾 Base de datos

El esquema recomendado para la base de datos es:

### Tabla orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR NOT NULL,
  table_number VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla order_items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  variations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🌟 Funcionalidades

- **Visualización de comandas**: Muestra todas las comandas actuales con sus estados.
- **Actualización de estado**: Permite cambiar el estado de una comanda (pendiente, preparando, lista, entregada).
- **Tiempo real**: Actualiza la interfaz cuando hay cambios en la base de datos.
- **Creación de comandas**: Interfaz para simular la creación de nuevas comandas.
- **Filtrado**: Filtra comandas por su estado actual.
- **Estadísticas**: Muestra estadísticas sobre comandas activas.

## 👀 Want to learn more?

Feel free to check [Astro documentation](https://docs.astro.build) or [Supabase documentation](https://supabase.io/docs).
