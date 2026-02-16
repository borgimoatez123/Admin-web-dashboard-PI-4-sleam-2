import api from './api';
import { Incident } from '@/types';

type IncidentsListApiResponse =
  | Incident[]
  | { incidents: Incident[] }
  | { success: boolean; data: any[] };

const normalizeIncident = (raw: any): Incident => {
  const id = raw?.id ?? raw?._id ?? '';
  const location = raw?.location ?? {};
  const lat = Number(location?.lat ?? raw?.lat ?? 0);
  const lng = Number(location?.lng ?? raw?.lng ?? 0);
  const type = String(raw?.type ?? '').toUpperCase() === 'ACCIDENT' ? 'ACCIDENT' : 'STOLEN';

  return {
    id: String(id),
    vehicleId: String(raw?.vehicleId ?? raw?.vehicle ?? ''),
    type,
    location: { lat, lng },
    description: String(raw?.description ?? ''),
    resolved: Boolean(raw?.resolved),
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    resolvedAt: raw?.resolvedAt ? String(raw.resolvedAt) : undefined,
  };
};

export const getIncidents = async (): Promise<Incident[]> => {
  try {
    const response = await api.get<IncidentsListApiResponse>('/incidents');
    const data: unknown = response.data;

    if (Array.isArray(data)) return data.map(normalizeIncident);
    if (typeof data === 'object' && data !== null) {
      const record = data as Record<string, unknown>;
      if (Array.isArray(record.incidents)) return (record.incidents as unknown[]).map(normalizeIncident);
      if (Array.isArray(record.data)) return (record.data as unknown[]).map(normalizeIncident);
    }

    return [];
  } catch (error: any) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const getActiveIncidents = async () => {
  const incidents = await getIncidents();
  return incidents.filter(i => !i.resolved);
};

export const createIncident = async (data: Partial<Incident>) => {
  const response = await api.post<any>('/incidents', data);
  const payload: any = response.data?.data ?? response.data;
  return normalizeIncident(payload);
};

export const resolveIncident = async (id: string) => {
  try {
    const response = await api.patch<any>(`/incidents/${id}/resolve`);
    const payload: any = response.data?.data ?? response.data;
    return normalizeIncident(payload);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const response = await api.put<any>(`/incidents/${id}`, { resolved: true });
      const payload: any = response.data?.data ?? response.data;
      return normalizeIncident(payload);
    }
    throw error;
  }
};
