# Burger Cravvy 🍔

[![CI](https://github.com/Angelismejia/burger-cravvy-fullstack/actions/workflows/ci.yml/badge.svg)](https://github.com/Angelismejia/burger-cravvy-fullstack/actions/workflows/ci.yml)

Hamburguesería retro ficticia: landing page en React + API en .NET con Clean Architecture y SQL Server.

## Estructura

```
BurgerCravvy.sln
src/
├── BurgerCravvy.Domain/          Entidades (Product, Order, OrderItem), enums y reglas de negocio. Sin dependencias.
├── BurgerCravvy.Application/     Casos de uso (ProductService, OrderService), DTOs e interfaces de repositorio.
├── BurgerCravvy.Infrastructure/  EF Core + SQL Server: AppDbContext, configuraciones, migraciones, repositorios, datos semilla.
├── BurgerCravvy.Api/             ASP.NET Core Web API: controladores, hub SignalR, JWT, ProblemDetails, CORS, Swagger.
└── BurgerCravvy.Web/             React + TypeScript + Vite + Tailwind + Motion + SignalR
    └── src/
        ├── domain/               Tipos y lógica pura (producto, carrito, pedido)
        ├── application/          Estado del carrito/menú y casos de uso (pedir, seguir pedido, panel)
        ├── infrastructure/       Cliente HTTP, SignalR, repositorios de la API, almacenamiento local
        └── presentation/         Componentes, web del cliente y panel de cocina
tests/
├── BurgerCravvy.Domain.Tests/       Reglas de negocio (estados del pedido, precios, códigos…)
└── BurgerCravvy.Application.Tests/  Casos de uso con repositorios en memoria (sin base de datos)
```

Dependencias: `Api → Application + Infrastructure`, `Infrastructure → Application → Domain`.

## Requisitos

- .NET SDK 9
- SQL Server (por defecto `.\SQLEXPRESS`, autenticación de Windows) — se cambia en `src/BurgerCravvy.Api/appsettings.json`
- Node.js 20.19+ o 22.12+ (requisito de Vite 8)

## Configuración inicial

```bash
# Copia la plantilla y pon tu propia clave JWT (32+ caracteres) y contraseña de prueba
cp src/BurgerCravvy.Api/appsettings.Development.example.json src/BurgerCravvy.Api/appsettings.Development.json
```

## Ejecutar

```bash
# 1) API  → http://localhost:5256/swagger  (en Development aplica las migraciones y crea BurgerCravvyDb)
dotnet run --project src/BurgerCravvy.Api --launch-profile http

# 2) Web  → http://localhost:5175
cd src/BurgerCravvy.Web
npm install
npm run dev -- --port 5175
```

La web usa `http://localhost:5256` por defecto. Para otra URL, crea `src/BurgerCravvy.Web/.env` con `VITE_API_URL=https://tu-api`. Si la API está apagada, la web muestra el menú con una copia local.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos?favoritos=true` | Menú (o solo favoritos) |
| GET | `/api/productos/{slug}` | Un producto |
| POST | `/api/pedidos` | Registra un pedido **pendiente** (demo, sin pagos) |
| GET | `/api/pedidos/{codigo}` | Seguimiento del pedido (cliente) |
| POST | `/api/auth/login` | Login de empleado → JWT (máx. 5 intentos/min) |
| GET | `/api/panel/pedidos` | 🔒 Cola de cocina (pendientes, en preparación, listos) |
| PATCH | `/api/panel/pedidos/{codigo}/estado` | 🔒 `{ "action": "preparar" \| "listo" \| "entregar" \| "cancelar" }` |
| GET | `/api/panel/productos` | 🔒 Menú completo, incluidos los retirados |
| PATCH | `/api/panel/productos/{slug}/disponibilidad` | 🔒 `{ "isAvailable": false }` (agotado) |
| POST | `/api/panel/productos` | 👑 Crear producto |
| PUT | `/api/panel/productos/{slug}` | 👑 Editar nombre, descripción, precio, foto, distintivo y favorito |
| POST | `/api/panel/productos/{slug}/retirar` | 👑 Retirar del menú (no se borra) |
| POST | `/api/panel/productos/{slug}/reactivar` | 👑 Volver a ponerlo en el menú |

🔒 = rol `Empleado` o `Admin` · 👑 = solo `Admin`. Ambos con `Authorization: Bearer <token>`;
en Swagger usa el botón **Authorize**.

## Panel de cocina

Entra en **http://localhost:5175/panel**. En Development la API crea dos usuarios de prueba con los datos de
`SeedEmployee` y `SeedAdmin` en `src/BurgerCravvy.Api/appsettings.Development.json` (correo y contraseña están ahí).

| Puede… | Empleado (cocina) | Admin |
|---|:-:|:-:|
| Ver y mover la cola de pedidos | ✅ | ✅ |
| Marcar productos agotados / disponibles | ✅ | ✅ |
| Cambiar precios | — | ✅ |
| Crear y editar productos | — | ✅ |
| Elegir los de «Nuestros Favoritos» | — | ✅ |
| Retirar y reactivar productos | — | ✅ |

Flujo de un pedido (las reglas viven en `Order` del Domain):

```
Pendiente ──► En preparación ──► Listo ──► Entregado
    └──────────────┴──► Cancelado
```

El cliente lo sigue desde **Sigue tu pedido** (footer, o al confirmar el pedido).

> ⚠️ `appsettings.Development.json` no se sube al repo (está en `.gitignore`).
> En producción usa variables de entorno (`Jwt__Key`, etc.) y no definas `SeedEmployee`.

## Tiempo real (SignalR)

Hub en **`/hubs/pedidos`**. Los casos de uso avisan a través de `IRealtimeNotifier` (Application) y
`SignalRNotifier` (Api) lo entrega:

| Evento | Quién lo recibe | Para qué |
|---|---|---|
| `OrderCreated` | grupo `cocina` (JWT de empleado) | El pedido aparece en el panel con aviso sonoro |
| `OrderUpdated` | `cocina` + grupo del pedido | La línea de tiempo del cliente avanza sola |
| `ProductUpdated` | todos | Precio y «Agotado» cambian sin recargar |

Métodos del hub: `JoinKitchen()` (solo empleados), `TrackOrder(codigo)` y `StopTracking(codigo)`.
Si se pierde la conexión, la web se reconecta sola y mientras tanto refresca cada 30 s.

## Tests

```bash
dotnet test                              # Domain + Application (xUnit)
cd src/BurgerCravvy.Web && npm test      # lógica del carrito y de pedidos (Vitest)
```

GitHub Actions ejecuta la compilación y todos los tests en cada push y pull request (`.github/workflows/ci.yml`).

## Migraciones

```bash
dotnet ef migrations add NombreMigracion -p src/BurgerCravvy.Infrastructure -s src/BurgerCravvy.Api -o Persistence/Migrations
```

> Las fotos son de Unsplash (por URL) y sirven de marcador de posición: se cambian en
> `presentation/siteContent.ts` (hero/galería) y en los datos semilla de `ProductConfiguration.cs` (productos).
