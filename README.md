# S.A.V.E.S Admin Dashboard

Professional Admin Dashboard for the S.A.V.E.S Rental System.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN UI
- **Icons:** Lucide React
- **Charts:** Recharts
- **Maps:** Leaflet + React Leaflet
- **Data:** React Hooks + Axios
- **Forms:** React Hook Form + Zod

## Features

- **Authentication:** Admin login with JWT stored in cookies.
- **Dashboard Overview:** Stats cards and charts (Revenue, Vehicles, Bookings).
- **Vehicles Management:** List, filter, add, edit, delete vehicles; quick status updates.
- **Bookings Management:** View bookings, update status, cancel.
- **Users Management:** View client users, block/unblock, delete.
- **Live Tracking:** Real-time fleet tracking map with status focus.
- **Responsive Sidebar:** Navigation with active states.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- A running backend API (default: `http://localhost:5000/api/v1`)

### Install & Run

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment (optional):**

   Create `.env.local`:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

   If not provided, the app uses `http://localhost:5000/api/v1` by default.

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open the dashboard:**

   Navigate to [http://localhost:3000](http://localhost:3000). You will be redirected to the login page.

5. **Login:**

   Use an admin account that exists in your backend.

   Example used during local development:

   - `admin@saves.com` / `saves123@A`

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Base URL of the backend REST API (example: `http://localhost:5000/api/v1`)

## Authentication

- Login calls `POST /auth/login` and stores:
  - `token` cookie (JWT)
  - `user` cookie (serialized user object)
- All API requests automatically attach:
  - `Authorization: Bearer <token>` header
- Middleware protects `/dashboard/*` and redirects to `/login` when:
  - no token
  - token expired
  - user role is not admin

Key files:

- [authService.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/services/authService.ts)
- [api.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/services/api.ts)
- [middleware.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/middleware.ts)

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (Sidebar, etc.).
- `components/ui/`: ShadCN UI components.
- `lib/`: Utilities.
- `services/`: Backend API service layer (Axios).
- `types/`: TypeScript definitions.
- `middleware.ts`: Authentication middleware.

## Routes

- `/login`: Admin login
- `/dashboard`: Overview metrics + chart
- `/dashboard/vehicles`: Vehicles CRUD + quick status updates
- `/dashboard/bookings`: Bookings list + status updates/cancel
- `/dashboard/users`: Client users list + block/unblock/delete
- `/dashboard/tracking`: Live fleet tracking map (polls every 5 seconds)
- `/dashboard/incidents`: Incidents list + resolve

## Documentation

- [API](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/docs/API.md)
- [Pages](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/docs/PAGES.md)
- [Architecture](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/docs/ARCHITECTURE.md)
