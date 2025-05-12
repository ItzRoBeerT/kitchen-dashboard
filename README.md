# Dashboard de Comandas para Cocina

Aplicación web desarrollada con Astro para visualizar y gestionar las comandas que llegan a la cocina de un restaurante.

## 📋 Características

- 📊 Panel de control con estadísticas en tiempo real
- 🧩 Filtrado de comandas por estado
- 🔄 Actualización del estado de las comandas
- ➕ Simulador para crear nuevas comandas
- 🖼️ Interfaz de usuario moderna y responsive
- 🔌 Estructura preparada para integración con API externa

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
│   │   ├── OrderStats.astro   # Estadísticas de comandas
│   │   └── Welcome.astro      # Componente inicial
│   ├── data/
│   │   └── ordersMock.ts      # Datos de prueba y modelos de datos
│   ├── layouts/
│   │   └── Layout.astro       # Layout principal de la aplicación
│   ├── pages/
│   │   ├── api/               # Endpoints API simulados
│   │   │   ├── orders.ts      # GET/POST para comandas
│   │   │   └── orders/[id].ts # PUT para actualizar estados
│   │   ├── crear.astro        # Página para crear nuevas comandas
│   │   └── index.astro        # Dashboard principal
│   └── services/
│       └── orderService.ts    # Servicio para gestionar comandas
└── package.json
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

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
