import api from './api';
import { Vehicle } from '@/types';

type VehiclesListApiResponse =
  | Vehicle[]
  | { vehicles: Vehicle[]; total?: number }
  | { success: boolean; count?: number; data: any[]; pagination?: any };

type VehicleUpsertInput = Partial<Vehicle> & {
  lat?: number;
  lng?: number;
  location?: { city?: string; lat?: number; lng?: number };
};

const normalizeVehicleStatus = (status: unknown): Vehicle['status'] => {
  if (typeof status !== 'string') return 'AVAILABLE';
  const s = status.toUpperCase();
  if (s === 'AVAILABLE' || s === 'BOOKED' || s === 'MAINTENANCE' || s === 'STOLEN' || s === 'ACCIDENT') return s as Vehicle['status'];
  if (s === 'CANCELLED') return 'AVAILABLE';
  return 'AVAILABLE';
};

const toServerStatus = (status: unknown): string | undefined => {
  if (typeof status !== 'string') return undefined;
  const s = status.trim();
  if (!s) return undefined;

  const upper = s.toUpperCase();
  if (upper === 'AVAILABLE') return 'Available';
  if (upper === 'BOOKED') return 'Booked';
  if (upper === 'STOLEN') return 'Stolen';
  if (upper === 'ACCIDENT') return 'Accident';
  if (upper === 'MAINTENANCE') return 'Maintenance';

  const lower = s.toLowerCase();
  if (lower === 'available') return 'Available';
  if (lower === 'booked') return 'Booked';
  if (lower === 'stolen') return 'Stolen';
  if (lower === 'accident') return 'Accident';
  if (lower === 'maintenance') return 'Maintenance';

  const title = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  if (title === 'Available' || title === 'Booked' || title === 'Stolen' || title === 'Accident' || title === 'Maintenance') return title;

  return undefined;
};

const toServerVehiclePayload = (input: VehicleUpsertInput) => {
  const status = toServerStatus(input.status);
  const locationFromInput: { city?: string; lat?: number; lng?: number } = input.location ?? {};
  const locationCity = locationFromInput.city ?? input.city;
  const lat = typeof locationFromInput.lat === 'number' ? locationFromInput.lat : input.lat;
  const lng = typeof locationFromInput.lng === 'number' ? locationFromInput.lng : input.lng;

  const payload: any = {
    model: input.model,
    variant: input.variant,
    plateNumber: input.plateNumber,
    year: input.year,
    color: input.color,
    pricePerDay: input.pricePerDay,
    status,
  };

  if (locationCity || typeof lat === 'number' || typeof lng === 'number') {
    payload.location = {
      ...(locationCity ? { city: String(locationCity) } : {}),
      ...(typeof lat === 'number' ? { lat } : {}),
      ...(typeof lng === 'number' ? { lng } : {}),
    };
  }

  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
  if (payload.location && Object.keys(payload.location).length === 0) delete payload.location;

  return payload;
};

const normalizeVehicle = (raw: any): Vehicle => {
  const id = raw?.id ?? raw?._id ?? '';
  const location = raw?.location ?? {};
  const city = location?.city ?? raw?.city ?? '';
  const lat = location?.lat ?? raw?.lat;
  const lng = location?.lng ?? raw?.lng;

  return {
    id: String(id),
    model: String(raw?.model ?? ''),
    variant: String(raw?.variant ?? ''),
    plateNumber: String(raw?.plateNumber ?? ''),
    year: Number(raw?.year ?? 0),
    color: typeof raw?.color === 'string' ? raw.color : undefined,
    pricePerDay: Number(raw?.pricePerDay ?? 0),
    status: normalizeVehicleStatus(raw?.status),
    city: String(city),
    location: typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : undefined,
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw?.updatedAt ?? raw?.createdAt ?? new Date().toISOString()),
    batteryLevel: typeof raw?.batteryLevel === 'number' ? raw.batteryLevel : undefined,
    currentSpeed: typeof raw?.currentSpeed === 'number' ? raw.currentSpeed : undefined,
    lastUpdate: typeof raw?.lastUpdate === 'string' ? raw.lastUpdate : undefined,
    imageUrl: typeof raw?.imageUrl === 'string' ? raw.imageUrl : undefined,
  };
};

export const getVehicles = async (page = 1, limit = 10, status?: string, plateNumber?: string) => {
  try {
    const params: Record<string, any> = { page, limit };
    if (status && status !== 'ALL') params.status = String(status).toLowerCase();
    if (plateNumber) params.plateNumber = plateNumber;

    const response = await api.get<VehiclesListApiResponse>('/vehicles', { params });
    const data: any = response.data;

    if (Array.isArray(data)) {
      const vehicles = data.map(normalizeVehicle);
      return { vehicles, total: vehicles.length };
    }

    if (Array.isArray(data?.vehicles)) {
      const vehicles = data.vehicles.map(normalizeVehicle);
      return { vehicles, total: Number(data.total ?? vehicles.length) };
    }

    if (Array.isArray(data?.data)) {
      const vehicles = data.data.map(normalizeVehicle);
      return { vehicles, total: Number(data.count ?? vehicles.length) };
    }

    return { vehicles: [], total: 0 };
  } catch (error) {
    throw error;
  }
};

export const getAllVehiclesForMap = async () => {
  try {
    const response = await api.get<VehiclesListApiResponse>('/vehicles', { params: { limit: 1000 } });
    const data: any = response.data;

    if (Array.isArray(data)) return data.map(normalizeVehicle);
    if (Array.isArray(data?.vehicles)) return data.vehicles.map(normalizeVehicle);
    if (Array.isArray(data?.data)) return data.data.map(normalizeVehicle);

    return [];
  } catch (error) {
    return [];
  }
};

export const getVehicle = async (id: string) => {
  try {
    const response = await api.get<any>(`/vehicles/${id}`);
    const data: any = response.data?.data ?? response.data;
    return normalizeVehicle(data);
  } catch (error) {
    throw error;
  }
};

export const createVehicle = async (data: VehicleUpsertInput) => {
  try {
    const response = await api.post<any>('/vehicles', toServerVehiclePayload(data));
    const payload: any = response.data?.data ?? response.data;
    return normalizeVehicle(payload);
  } catch (error) {
    throw error;
  }
};

export const updateVehicle = async (id: string, data: VehicleUpsertInput) => {
  try {
    const response = await api.put<any>(`/vehicles/${id}`, toServerVehiclePayload(data));
    const payload: any = response.data?.data ?? response.data;
    return normalizeVehicle(payload);
  } catch (error) {
    throw error;
  }
};

export const deleteVehicle = async (id: string) => {
  try {
    await api.delete(`/vehicles/${id}`);
    return { success: true };
  } catch (error) {
    throw error;
  }
};
