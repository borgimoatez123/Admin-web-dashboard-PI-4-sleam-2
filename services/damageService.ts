import axios from 'axios';
import { getCookie } from 'cookies-next';

const damagesApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DAMAGES_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

damagesApi.interceptors.request.use((config) => {
  const token = getCookie('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Damage {
  id: string;
  isDamage: number;
  degat: 'GRAVE' | 'MODERE' | 'LEGER' | string;
  force_N: number;
  vitesse_ms: number;
  distance_debut_mm: number;
  distance_fin_mm: number;
  delta_distance_mm: number;
  delta_temps_s: number;
  heure_debut: string;
  heure_fin: string;
  seuil_N: number;
  masse_kg: number;
  gps_fixe: boolean;
  location: { latitude: number; longitude: number };
  createdAt: string;
}

const normalizeDamage = (raw: any): Damage => ({
  id: String(raw?._id ?? raw?.id ?? ''),
  isDamage: Number(raw?.isDamage ?? 0),
  degat: String(raw?.degat ?? ''),
  force_N: Number(raw?.force_N ?? 0),
  vitesse_ms: Number(raw?.vitesse_ms ?? 0),
  distance_debut_mm: Number(raw?.distance_debut_mm ?? 0),
  distance_fin_mm: Number(raw?.distance_fin_mm ?? 0),
  delta_distance_mm: Number(raw?.delta_distance_mm ?? 0),
  delta_temps_s: Number(raw?.delta_temps_s ?? 0),
  heure_debut: String(raw?.heure_debut ?? ''),
  heure_fin: String(raw?.heure_fin ?? ''),
  seuil_N: Number(raw?.seuil_N ?? 0),
  masse_kg: Number(raw?.masse_kg ?? 0),
  gps_fixe: Boolean(raw?.gps_fixe),
  location: {
    latitude: Number(raw?.location?.latitude ?? 0),
    longitude: Number(raw?.location?.longitude ?? 0),
  },
  createdAt: String(raw?.createdAt ?? new Date().toISOString()),
});

export const getDamages = async (): Promise<Damage[]> => {
  try {
    const response = await damagesApi.get('/damages');
    const data: any = response.data;
    if (Array.isArray(data)) return data.map(normalizeDamage);
    if (Array.isArray(data?.data)) return data.data.map(normalizeDamage);
    return [];
  } catch {
    return [];
  }
};
