import api from './api';
import { User } from '@/types';

type UsersListApiResponse =
  | User[]
  | { users: User[]; total?: number }
  | { success: boolean; count?: number; data: any[]; pagination?: any };

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
    status: String(data?.status ?? 'ACTIVE').toUpperCase() === 'BLOCKED' ? 'BLOCKED' : 'ACTIVE',
    createdAt: String(data?.createdAt ?? new Date().toISOString()),
  };
};

export const getUsers = async (page = 1, limit = 10) => {
  const candidates = [
    { url: '/users', params: { page, limit, role: 'client' } },
    { url: '/users', params: { page, limit, role: 'CLIENT' } },
    { url: '/users', params: { page, limit, type: 'client' } },
    { url: '/users', params: { page, limit } },
  ];

  let anyEndpointWorked = false;
  for (const candidate of candidates) {
    try {
      const response = await api.get<UsersListApiResponse>(candidate.url, { params: candidate.params });
      const data: any = response.data;
      anyEndpointWorked = true;

      if (Array.isArray(data)) {
        const users = data.map(normalizeUser).filter((u: User) => u.role === 'CLIENT');
        return { users, total: users.length, page, limit };
      }

      if (Array.isArray(data?.users)) {
        const users = data.users.map(normalizeUser).filter((u: User) => u.role === 'CLIENT');
        return { users, total: Number(data.total ?? users.length), page, limit };
      }

      if (Array.isArray(data?.data)) {
        const users = data.data.map(normalizeUser).filter((u: User) => u.role === 'CLIENT');
        return { users, total: Number(data.count ?? users.length), page, limit };
      }
    } catch (error: any) {
      if (error?.response?.status === 404) continue;
      throw error;
    }
  }

  if (!anyEndpointWorked) {
    throw new Error('USERS_ENDPOINT_NOT_FOUND');
  }

  return { users: [], total: 0, page, limit };
};

export const updateUserStatus = async (id: string, status: 'ACTIVE' | 'BLOCKED') => {
  try {
    const response = await api.patch<any>(`/users/${id}`, { status: status.toLowerCase() });
    const payload: any = response.data?.data ?? response.data;
    return normalizeUser(payload);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      const response = await api.put<any>(`/users/${id}`, { status: status.toLowerCase() });
      const payload: any = response.data?.data ?? response.data;
      return normalizeUser(payload);
    }
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}`);
  return { success: true };
};
