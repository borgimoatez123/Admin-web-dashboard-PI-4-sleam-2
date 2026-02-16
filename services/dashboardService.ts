import api from './api';
import { DashboardStats } from '@/types';

type VehiclesListApiResponse = { success: boolean; count?: number; data: any[] };
type BookingsListApiResponse = { success: boolean; count?: number; data: any[] };

const monthLabel = (date: Date) => date.toLocaleString('en-US', { month: 'short' });

const normalizeVehicleStatus = (status: unknown): string => {
  if (typeof status !== 'string') return 'AVAILABLE';
  const s = status.toUpperCase();
  if (s === 'AVAILABLE' || s === 'BOOKED' || s === 'MAINTENANCE' || s === 'STOLEN' || s === 'ACCIDENT') return s;
  return 'AVAILABLE';
};

const normalizeBookingPaymentStatus = (status: unknown): string => {
  if (typeof status !== 'string') return 'PENDING';
  const s = status.toUpperCase();
  if (s === 'PAID' || s === 'PENDING' || s === 'FAILED') return s;
  return 'PENDING';
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [vehiclesRes, bookingsRes] = await Promise.all([
    api.get<VehiclesListApiResponse>('/vehicles', { params: { limit: 1000 } }),
    api.get<BookingsListApiResponse>('/bookings', { params: { limit: 1000 } }),
  ]);

  const vehicles = Array.isArray(vehiclesRes.data?.data) ? vehiclesRes.data.data : [];
  const bookings = Array.isArray(bookingsRes.data?.data) ? bookingsRes.data.data : [];

  let availableVehicles = 0;
  let bookedVehicles = 0;
  let maintenanceVehicles = 0;
  let stolenVehicles = 0;
  let accidentVehicles = 0;

  for (const v of vehicles) {
    const status = normalizeVehicleStatus(v?.status);
    if (status === 'AVAILABLE') availableVehicles += 1;
    else if (status === 'BOOKED') bookedVehicles += 1;
    else if (status === 'MAINTENANCE') maintenanceVehicles += 1;
    else if (status === 'STOLEN') stolenVehicles += 1;
    else if (status === 'ACCIDENT') accidentVehicles += 1;
  }

  const bookingsPerMonthMap = new Map<string, number>();
  let revenue = 0;

  for (const b of bookings) {
    const dateStr = b?.createdAt ?? b?.startDate ?? b?.updatedAt;
    const date = dateStr ? new Date(dateStr) : new Date();
    const key = monthLabel(date);
    bookingsPerMonthMap.set(key, (bookingsPerMonthMap.get(key) ?? 0) + 1);

    const paymentStatus = normalizeBookingPaymentStatus(b?.paymentStatus);
    if (paymentStatus === 'PAID') {
      revenue += Number(b?.totalPrice ?? 0);
    }
  }

  const bookingsPerMonth = Array.from(bookingsPerMonthMap.entries()).map(([month, count]) => ({ month, count }));

  return {
    totalVehicles: vehicles.length,
    availableVehicles,
    bookedVehicles,
    maintenanceVehicles,
    stolenVehicles,
    accidentVehicles,
    totalUsers: 1,
    totalBookings: bookings.length,
    revenue,
    bookingsPerMonth,
    vehicleStatusDistribution: [
      { name: 'Available', value: availableVehicles, fill: '#10b981' },
      { name: 'Booked', value: bookedVehicles, fill: '#3b82f6' },
      { name: 'Maintenance', value: maintenanceVehicles, fill: '#f59e0b' },
      { name: 'Stolen', value: stolenVehicles, fill: '#ef4444' },
      { name: 'Accident', value: accidentVehicles, fill: '#991b1b' },
    ],
  };
};
