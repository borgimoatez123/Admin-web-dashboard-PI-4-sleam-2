# Pages

This document describes the main routes and what they do.

## Public

### `/login`

- Admin login page
- Calls `POST /auth/login`
- Stores cookies: `token` and `user`

Source: [login/page.tsx](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/app/login/page.tsx)

## Protected (Admin)

All routes below are protected by middleware.

### `/dashboard`

- Overview cards and charts
- Aggregated stats built from vehicles + bookings

Source: [dashboard/page.tsx](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/app/dashboard/page.tsx)

### `/dashboard/vehicles`

- List vehicles with search/filter
- Add/Edit vehicle dialog
- Delete vehicle
- Quick status actions:
  - Available
  - Booked
  - Stolen
  - Accident

Notes:

- Add Vehicle always defaults status to Available.
- Location coordinates are derived from the selected Tunisia state and sent as `location.lat/lng`.

Source: [vehicles/page.tsx](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/app/dashboard/vehicles/page.tsx)

### `/dashboard/bookings`

- List bookings
- Update booking status
- Cancel booking

Source: [bookings/page.tsx](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/app/dashboard/bookings/page.tsx)

### `/dashboard/users`

- Lists client users (role = client)
- Block / unblock user (status ACTIVE/BLOCKED)
- Delete user

Source: [users/page.tsx](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/app/dashboard/users/page.tsx)

### `/dashboard/tracking`

- Live fleet tracking map (Leaflet)
- Polls vehicle locations periodically
- Fleet Status panel filters vehicles and focuses map to their locations

Source: [tracking/page.tsx](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/app/dashboard/tracking/page.tsx)

### `/dashboard/incidents`

- List incidents
- Resolve incident (PATCH/PUT fallback depending on backend)

Source: [incidents/page.tsx](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/app/dashboard/incidents/page.tsx)

