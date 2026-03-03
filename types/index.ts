export type Role = 'ADMIN' | 'CLIENT' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  agencyName?: string;
  agencyLocation?: {
    city?: string;
    lat?: number;
    lng?: number;
  };
}

export type VehicleStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'STOLEN' | 'ACCIDENT';

export interface VehicleLocation {
  lat: number;
  lng: number;
}

export interface Vehicle {
  id: string;
  model: string; // e.g., SAVES_PROTOTYPE_V1
  variant: 'SUV' | 'SEDAN' | string;
  plateNumber: string;
  year: number;
  color?: string;
  pricePerDay: number;
  status: VehicleStatus;
  city: string;
  imageUrl?: string;
  agency?: {
    name?: string;
    location?: {
      city?: string;
      lat?: number;
      lng?: number;
    };
  };
  
  // Telemetry Data
  location?: VehicleLocation;
  batteryLevel?: number; // 0-100
  currentSpeed?: number; // km/h
  lastUpdate?: string; // ISO timestamp
  
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  user?: User; // Populated
  vehicle?: Vehicle; // Populated
  agency?: {
    name?: string;
    location?: {
      city?: string;
      lat?: number;
      lng?: number;
    };
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface Incident {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle; // Populated
  type: 'STOLEN' | 'ACCIDENT';
  location: VehicleLocation;
  description: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  bookedVehicles: number;
  maintenanceVehicles: number;
  stolenVehicles: number;
  accidentVehicles: number;
  totalUsers: number;
  totalBookings: number;
  revenue: number;
  bookingsPerMonth: { month: string; count: number }[];
  vehicleStatusDistribution: { name: string; value: number; fill: string }[];
}
