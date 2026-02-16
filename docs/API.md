# API

This frontend expects a REST backend (default base URL: `http://localhost:5000/api/v1`).

The Axios base URL is configured in:
- [api.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/services/api.ts)

## Authentication

### Login

- Method: `POST`
- URL: `/auth/login`
- Body:
  - `email` (string)
  - `password` (string)
- Response:
  - `token` (string, JWT)
  - `user` (object)

Used by: [authService.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/services/authService.ts)

### Current User

- Method: `GET`
- URL: `/auth/me`
- Headers:
  - `Authorization: Bearer <token>`

## Users

### List Users

The UI calls:

- Method: `GET`
- URL: `/users`
- Headers:
  - `Authorization: Bearer <token>`

The frontend supports these response shapes:

- `User[]`
- `{ users: User[], total?: number }`
- `{ success: true, count?: number, data: any[] }`

The admin UI filters and displays only users with role `client` (shown as `CLIENT` in UI).

Used by: [userService.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/services/userService.ts)

### Update User Status

- Method: `PATCH` (fallback `PUT` if PATCH not supported)
- URL: `/users/:id`
- Headers:
  - `Authorization: Bearer <token>`
- Body:
  - `status`: `"active"` or `"blocked"` (frontend sends lowercase)

### Delete User

- Method: `DELETE`
- URL: `/users/:id`
- Headers:
  - `Authorization: Bearer <token>`

## Vehicles

### List Vehicles

- Method: `GET`
- URL: `/vehicles`
- Query params (optional):
  - `page`, `limit`
  - `status`: lowercase (`available`, `booked`, `maintenance`, `stolen`, `accident`)
  - `plateNumber`

### Create Vehicle

- Method: `POST`
- URL: `/vehicles`
- Headers:
  - `Authorization: Bearer <token>`
- Body (example):
  ```json
  {
    "model": "SAVES_PROTOTYPE_V1",
    "variant": "SUV",
    "plateNumber": "TUN-1234",
    "year": 2024,
    "color": "Matte Black",
    "pricePerDay": 150,
    "status": "Available",
    "location": { "city": "Tunis", "lat": 36.8065, "lng": 10.1815 }
  }
  ```

Notes:

- The frontend sends `status` in Title Case for create/update:
  - `Available`, `Booked`, `Stolen`, `Accident`, `Maintenance`
- In the Add Vehicle form, status is always defaulted to `Available`.
- Location coordinates are derived from the selected Tunisia state.

Used by: [vehicleService.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/services/vehicleService.ts)

### Update Vehicle

- Method: `PUT`
- URL: `/vehicles/:vehicleId`
- Headers:
  - `Authorization: Bearer <token>`
- Body (status example):
  ```json
  { "status": "Stolen" }
  ```

## Bookings

### List Bookings

- Method: `GET`
- URL: `/bookings`
- Query params (optional): `page`, `limit`, `status`

### Update Booking Status

- Method: `PATCH` or `PUT` (depends on backend)
- URL: `/bookings/:id`
- Body: `{ "status": "..." }`

### Cancel Booking

- Method: `POST` or `PATCH` (depends on backend)
- URL: `/bookings/:id/cancel`

Used by: [bookingService.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/services/bookingService.ts)

## Incidents

### List Incidents

- Method: `GET`
- URL: `/incidents`

### Resolve Incident

The frontend tries:

1. `PATCH /incidents/:id/resolve`
2. If 404, fallback to `PUT /incidents/:id` with `{ "resolved": true }`

Used by: [incidentService.ts](file:///c:/Users/borgi/Documents/trae_projects/New%20folder/saves-admin/services/incidentService.ts)

