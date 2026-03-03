'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getDashboardStats } from '@/services/dashboardService';
import { DashboardStats } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, DollarSign, Car, Users, CalendarCheck, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { getAllVehiclesForMap } from '@/services/vehicleService';
import { StatsCard } from '@/components/ui-custom/StatsCard';
import { motion } from 'framer-motion';

// Map preview (smaller, no zoom controls if possible, but Leaflet controls are default)
const LeafletMap = dynamic(() => import('@/components/Map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse rounded-lg" />,
});

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mapVehicles, setMapVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, vehiclesData] = await Promise.all([
          getDashboardStats(),
          getAllVehiclesForMap()
        ]);
        setStats(statsData);
        setMapVehicles(vehiclesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return <div>Failed to load data</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, Admin. Here&apos;s what&apos;s happening with your fleet today.
          </p>
        </div>
        <div className="flex gap-2">
           <Link href="/dashboard/tracking">
             <Button className="shadow-lg shadow-primary/20">Live Tracking Map</Button>
           </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          trend="+20.1%"
          trendUp={true}
          description="from last month"
          color="green"
          delay={0.1}
        />
        <StatsCard
          title="Active Fleet"
          value={stats.totalVehicles}
          icon={Car}
          description={`${stats.availableVehicles} Available • ${stats.bookedVehicles} Booked`}
          color="blue"
          delay={0.2}
        />
        <StatsCard
          title="Critical Alerts"
          value={stats.stolenVehicles + stats.accidentVehicles}
          icon={ShieldAlert}
          description={`${stats.stolenVehicles} Stolen • ${stats.accidentVehicles} Accident`}
          color="red"
          delay={0.3}
        />
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={CalendarCheck}
          trend="+12"
          trendUp={true}
          description="since last hour"
          color="orange"
          delay={0.4}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <motion.div 
          className="col-span-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="h-full border-none shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue statistics for the current year</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.bookingsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Map Preview */}
        <motion.div 
          className="col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="h-full border-none shadow-sm flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Map Preview</CardTitle>
                <Link href="/dashboard/tracking" className="text-xs text-primary hover:underline font-medium">
                  View Full Screen
                </Link>
              </div>
              <CardDescription>Real-time fleet locations</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[300px] relative">
               <div className="absolute inset-0 rounded-b-xl overflow-hidden">
                 <LeafletMap vehicles={mapVehicles} zoom={3} />
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
