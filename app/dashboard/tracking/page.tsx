'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { getAllVehiclesForMap } from '@/services/vehicleService';
import { Vehicle } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, Car, ShieldAlert, AlertTriangle, Wrench, CalendarDays, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import VehicleMonitoringSimulation from '@/components/VehicleMonitoringSimulation';
import { getCurrentUser } from '@/services/authService';

// Dynamically import Leaflet map to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/Map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/20">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
    </div>
  ),
});

export default function TrackingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null); // Initialize as null to prevent hydration mismatch
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [agencyNameFilter, setAgencyNameFilter] = useState<string | undefined>(undefined);

  const fetchLocations = async () => {
    try {
      const data: Vehicle[] = await getAllVehiclesForMap();
      const filtered = agencyNameFilter
        ? data.filter((v: Vehicle) => (v.agency?.name ?? '').trim().toLowerCase() === agencyNameFilter.trim().toLowerCase())
        : data;
      setVehicles(filtered);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch vehicle locations', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => {
      if (!mounted) return;
      setAgencyNameFilter(u?.agencyName);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchLocations();

    // Poll every 5 seconds
    timerRef.current = setInterval(fetchLocations, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [agencyNameFilter]);

  const getStatusCount = (status: string) => 
    vehicles.filter(v => v.status === status).length;

  const statusFilters = [
    { label: 'Available', status: 'AVAILABLE', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Booked', status: 'BOOKED', icon: CalendarDays, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Maintenance', status: 'MAINTENANCE', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Stolen', status: 'STOLEN', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-600/10 border-red-600/20' },
    { label: 'Accident', status: 'ACCIDENT', icon: AlertTriangle, color: 'text-red-800', bg: 'bg-red-800/10 border-red-800/20' },
  ];

  const mapVehicles = selectedStatus ? vehicles.filter(v => v.status === selectedStatus) : vehicles;
  const focusPositions = mapVehicles
    .filter(v => v.location)
    .map(v => [v.location!.lat, v.location!.lng] as [number, number]);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col">
      {/* Floating Header Panel */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none"
      >
        <div className="bg-background/90 backdrop-blur-md shadow-lg border rounded-xl p-4 pointer-events-auto">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            Live Fleet Tracking
          </h2>
          <p className="text-muted-foreground text-sm">
            Real-time monitoring of {vehicles.length} vehicles
          </p>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <div className="bg-background/90 backdrop-blur-md shadow-lg border rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchLocations}
            className="bg-background/90 backdrop-blur-md shadow-lg h-10 w-10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Floating Status Legend */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-32 left-4 z-10 flex flex-col gap-2 pointer-events-none"
      >
        <div className="bg-background/90 backdrop-blur-md shadow-lg border rounded-xl p-2 flex flex-col gap-1 pointer-events-auto min-w-[160px]">
          <p className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">Fleet Status</p>
          {statusFilters.map((filter) => (
            <div 
              key={filter.status}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer group",
                filter.bg,
                selectedStatus === filter.status && "ring-2 ring-primary/50"
              )}
              onClick={() => setSelectedStatus(prev => (prev === filter.status ? null : filter.status))}
            >
              <div className="flex items-center gap-2">
                <filter.icon className={cn("h-4 w-4", filter.color)} />
                <span className="text-sm font-medium">{filter.label}</span>
              </div>
              <span className="text-sm font-bold ml-2">{getStatusCount(filter.status)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Full Screen Map */}
      <div className="h-full w-full">
        <LeafletMap
          vehicles={mapVehicles}
          focusPositions={selectedStatus ? focusPositions : undefined}
          onVehicleClick={(v: Vehicle) => setSelectedVehicle(v)}
          className="h-full w-full z-0"
        />
      </div>

      {selectedVehicle && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <div className="mb-3 flex justify-end">
              <Button variant="outline" className="bg-background/80 backdrop-blur-md" onClick={() => setSelectedVehicle(null)}>
                Close
              </Button>
            </div>
            <VehicleMonitoringSimulation key={selectedVehicle.id} vehicle={selectedVehicle} />
          </div>
        </div>
      )}
    </div>
  );
}
