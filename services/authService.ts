import api from './api';
import { User } from '@/types';
import { setCookie, deleteCookie } from 'cookies-next';

type LoginApiResponse =
  | { token: string }
  | { success: boolean; token: string }
  | string;

type MeApiResponse =
  | User
  | { user: User }
  | { data: User }
  | { success: boolean; data: any };

const normalizeRole = (role: unknown): User['role'] => {
  if (typeof role !== 'string') return 'USER';
  const r = role.toLowerCase();
  if (r === 'admin') return 'ADMIN';
  if (r === 'client') return 'CLIENT';
  return 'USER';
};

const normalizeUser = (raw: any): User => {
  const data = raw?.data ?? raw?.user ?? raw;
  const id = data?.id ?? data?._id ?? '';

  return {
    id: String(id),
    name: String(data?.name ?? ''),
    email: String(data?.email ?? ''),
    role: normalizeRole(data?.role),
    status: 'ACTIVE',
    createdAt: String(data?.createdAt ?? new Date().toISOString()),
    agencyName: typeof data?.agencyName === 'string' ? data.agencyName : data?.agency?.name,
    agencyLocation: (data?.agencyLocation || data?.agency?.location) ? {
      city: data?.agencyLocation?.city ?? data?.agency?.location?.city,
      lat: typeof (data?.agencyLocation?.lat ?? data?.agency?.location?.lat) === 'number' ? (data?.agencyLocation?.lat ?? data?.agency?.location?.lat) : undefined,
      lng: typeof (data?.agencyLocation?.lng ?? data?.agency?.location?.lng) === 'number' ? (data?.agencyLocation?.lng ?? data?.agency?.location?.lng) : undefined,
    } : undefined,
  };
};

const extractToken = (raw: any): string | null => {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  if (typeof raw?.token === 'string') return raw.token;
  if (typeof raw?.data?.token === 'string') return raw.data.token;
  if (typeof raw?.accessToken === 'string') return raw.accessToken;
  return null;
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post<LoginApiResponse>('/auth/login', { email, password });
    const token = extractToken(response.data);
    if (!token) {
      throw new Error('No token received from login');
    }

    setCookie('token', token, { maxAge: 60 * 60 * 24, path: '/', sameSite: 'lax' });

    const meResponse = await api.get<MeApiResponse>('/auth/me');
    const user = normalizeUser(meResponse.data);

    setCookie('user', JSON.stringify(user), { maxAge: 60 * 60 * 24, path: '/', sameSite: 'lax' });

    return user;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  deleteCookie('token');
  deleteCookie('user');
  window.location.href = '/login';
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get<MeApiResponse>('/auth/me');
    return normalizeUser(response.data);
  } catch (error) {
    return null;
  }
};

type UpdateAgencyPayload = {
  agencyName: string;
  agencyLocation: {
    city?: string;
    lat: number;
    lng: number;
  };
};

export const updateAgency = async (payload: UpdateAgencyPayload): Promise<User> => {
  const response = await api.put('/auth/agency', payload);
  // Many backends return updated user or a {success} object; refetch to be safe
  try {
    const me = await api.get<MeApiResponse>('/auth/me');
    return normalizeUser(me.data);
  } catch {
    // Fallback to minimal user shape if /me not available
    return normalizeUser(response.data);
  }
};
