# Architecture

## Overview

This repository is the admin frontend for the S.A.V.E.S rental system. It is a Next.js App Router application that talks to a REST backend (default base URL: `http://localhost:5000/api/v1`).

Key ideas:

- UI pages live under `app/` (App Router).
- API access is centralized in `services/` using Axios.
- Authentication is cookie-based on the frontend (JWT stored in `token` cookie) and enforced for all dashboard routes by `middleware.ts`.
- Domain types are centralized in `types/index.ts`.

## Data Flow

1. User logs in from `/login`.
2. `services/authService.ts` calls `POST /auth/login`.
3. JWT is stored in cookies (`token`) and a normalized user object is stored in `user`.
4. `services/api.ts` reads `token` cookie and attaches `Authorization: Bearer <token>` to all API requests.
5. Pages call `services/*` functions to fetch/update data and render UI.

## Authentication & Route Protection

- Protected routes: `/dashboard/*`
- Middleware checks:
  - JWT exists
  - JWT is not expired
  - user role is admin
- On failure, user is redirected to `/login`.

See:

- [middleware.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/middleware.ts)
- [authService.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/services/authService.ts)
- [api.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/services/api.ts)

## Frontend Modules

### `app/`

Pages and layouts (React Server Components by default; most dashboard pages are client components for interactivity and form handling).

### `services/`

REST client functions. Each service:

- Sends requests to backend endpoints (via `services/api.ts`)
- Normalizes backend response shapes into `types/` models
- Handles common fallbacks (some endpoints have PATCH/PUT fallbacks)

### `components/`

Reusable UI elements:

- Sidebar navigation
- Map component (`components/Map/LeafletMap.tsx`)
- Shared UI pieces

### `types/`

Domain types used throughout the app:

- `User`, `Vehicle`, `Booking`, `Incident`, `DashboardStats`

## Tracking Map Behavior

- `/dashboard/tracking` polls vehicle locations (every 5 seconds) and displays them on a Leaflet map.
- Clicking Fleet Status filters the vehicle list and focuses the map to the matching vehicle positions (single vehicle flies to it; multiple vehicles fit bounds).

See:

- [tracking/page.tsx](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/app/dashboard/tracking/page.tsx)
- [LeafletMap.tsx](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/components/Map/LeafletMap.tsx)
