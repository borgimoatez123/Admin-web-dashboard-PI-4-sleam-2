import api from './api';
import { Booking } from '@/types';

type BookingsListApiResponse =
  | Booking[]
  | { bookings: Booking[]; total?: number }
  | { success: boolean; count?: number; data: any[] };

const normalizeBookingStatus = (status: unknown): Booking['status'] => {
  if (typeof status !== 'string') return 'PENDING';
  const s = status.toUpperCase();
  if (s === 'PENDING' || s === 'CONFIRMED' || s === 'COMPLETED' || s === 'CANCELLED') return s as Booking['status'];
  return 'PENDING';
};

const normalizePaymentStatus = (status: unknown): Booking['paymentStatus'] => {
  if (typeof status !== 'string') return 'PENDING';
  const s = status.toUpperCase();
  if (s === 'PENDING' || s === 'PAID' || s === 'FAILED') return s as Booking['paymentStatus'];
  return 'PENDING';
};

const normalizeBooking = (raw: any): Booking => {
  const id = raw?.id ?? raw?._id ?? '';
  const user = raw?.user;
  const vehicle = raw?.vehicle;

  return {
    id: String(id),
    userId: String(raw?.userId ?? user?._id ?? user?.id ?? raw?.user ?? ''),
    vehicleId: String(raw?.vehicleId ?? vehicle?._id ?? vehicle?.id ?? raw?.vehicle ?? ''),
    user: user && typeof user === 'object' ? {
      id: String(user?._id ?? user?.id ?? ''),
      name: String(user?.name ?? ''),
      email: String(user?.email ?? ''),
      role: (String(user?.role ?? 'user').toLowerCase() === 'admin' ? 'ADMIN' : 'USER'),
      status: 'ACTIVE',
      createdAt: String(user?.createdAt ?? ''),
    } : undefined,
    agency: raw?.agency ? {
      name: typeof raw.agency?.name === 'string' ? raw.agency.name : undefined,
      location: raw.agency?.location ? {
        city: raw.agency?.location?.city,
        lat: typeof raw.agency?.location?.lat === 'number' ? raw.agency.location.lat : undefined,
        lng: typeof raw.agency?.location?.lng === 'number' ? raw.agency.location.lng : undefined,
      } : undefined,
    } : (raw?.agencyName || raw?.agencyLocation) ? {
      name: raw?.agencyName,
      location: raw?.agencyLocation ? {
        city: raw?.agencyLocation?.city,
        lat: typeof raw?.agencyLocation?.lat === 'number' ? raw.agencyLocation.lat : undefined,
        lng: typeof raw?.agencyLocation?.lng === 'number' ? raw.agencyLocation.lng : undefined,
      } : undefined,
    } : undefined,
    vehicle: vehicle && typeof vehicle === 'object' ? {
      id: String(vehicle?._id ?? vehicle?.id ?? ''),
      model: String(vehicle?.model ?? ''),
      variant: String(vehicle?.variant ?? ''),
      plateNumber: String(vehicle?.plateNumber ?? ''),
      year: Number(vehicle?.year ?? 0),
      pricePerDay: Number(vehicle?.pricePerDay ?? 0),
      status: (String(vehicle?.status ?? 'available').toUpperCase() as any),
      city: String(vehicle?.location?.city ?? vehicle?.city ?? ''),
      createdAt: String(vehicle?.createdAt ?? ''),
      updatedAt: String(vehicle?.updatedAt ?? vehicle?.createdAt ?? ''),
      location: (typeof vehicle?.location?.lat === 'number' && typeof vehicle?.location?.lng === 'number') ? { lat: vehicle.location.lat, lng: vehicle.location.lng } : undefined,
      agency: vehicle?.agency ? {
        name: typeof vehicle.agency?.name === 'string' ? vehicle.agency.name : undefined,
        location: vehicle.agency?.location ? {
          city: vehicle.agency?.location?.city,
          lat: typeof vehicle.agency?.location?.lat === 'number' ? vehicle.agency.location.lat : undefined,
          lng: typeof vehicle.agency?.location?.lng === 'number' ? vehicle.agency.location.lng : undefined,
        } : undefined,
      } : (vehicle?.agencyName || vehicle?.agencyLocation) ? {
        name: vehicle?.agencyName,
        location: vehicle?.agencyLocation ? {
          city: vehicle?.agencyLocation?.city,
          lat: typeof vehicle?.agencyLocation?.lat === 'number' ? vehicle.agencyLocation.lat : undefined,
          lng: typeof vehicle?.agencyLocation?.lng === 'number' ? vehicle.agencyLocation.lng : undefined,
        } : undefined,
      } : undefined,
    } as any : undefined,
    startDate: String(raw?.startDate ?? ''),
    endDate: String(raw?.endDate ?? ''),
    totalPrice: Number(raw?.totalPrice ?? 0),
    paymentStatus: normalizePaymentStatus(raw?.paymentStatus),
    status: normalizeBookingStatus(raw?.status),
    createdAt: String(raw?.createdAt ?? raw?.startDate ?? new Date().toISOString()),
  };
};

export const getBookings = async (page = 1, limit = 10, status?: string) => {
  try {
      const params: Record<string, any> = { page, limit };
      if (status && status !== 'ALL') params.status = status;

      const response = await api.get<BookingsListApiResponse>('/bookings', { params });
      const data: any = response.data;

      if (Array.isArray(data)) {
        const bookings = data.map(normalizeBooking);
        return { bookings, total: bookings.length };
      }

      if (Array.isArray(data?.bookings)) {
        const bookings = data.bookings.map(normalizeBooking);
        return { bookings, total: Number(data.total ?? bookings.length) };
      }

      if (Array.isArray(data?.data)) {
        const bookings = data.data.map(normalizeBooking);
        return { bookings, total: Number(data.count ?? bookings.length) };
      }

      return { bookings: [], total: 0 };
  } catch (error) {
      throw error;
  }
};

export const getBooking = async (id: string) => {
    try {
        const response = await api.get<any>(`/bookings/${id}`);
        const payload: any = response.data?.data ?? response.data;
        return normalizeBooking(payload);
    } catch (error) {
        throw error;
    }
};

export const updateBookingStatus = async (id: string, status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    try {
        const response = await api.put<any>(`/bookings/${id}`, { status: status.toLowerCase?.() ?? status });
        const payload: any = response.data?.data ?? response.data;
        return normalizeBooking(payload);
    } catch (error) {
        throw error;
    }
};

export const cancelBooking = async (id: string) => {
    return updateBookingStatus(id, 'CANCELLED');
};
