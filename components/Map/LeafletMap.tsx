'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Vehicle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Battery, Gauge, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

// Fix for default marker icons in Leaflet with Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on status
const getIcon = (status: string) => {
  let color = 'green';
  if (status === 'BOOKED') color = 'blue';
  if (status === 'MAINTENANCE') color = 'orange';
  if (status === 'STOLEN') color = 'red';
  if (status === 'ACCIDENT') color = 'darkred';

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface MapProps {
  vehicles: Vehicle[];
  center?: [number, number];
  zoom?: number;
  focusPositions?: [number, number][];
  className?: string;
}

function MapFocusController({ focusPositions, center, zoom }: { focusPositions?: [number, number][]; center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (!focusPositions || focusPositions.length === 0) return;

    if (focusPositions.length === 1) {
      map.flyTo(focusPositions[0], Math.max(zoom, 12), { animate: true, duration: 0.8 });
      return;
    }

    const bounds = L.latLngBounds(focusPositions.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [focusPositions, map, zoom]);

  useEffect(() => {
    if (focusPositions && focusPositions.length > 0) return;
    map.setView(center, zoom, { animate: false });
  }, [center, focusPositions, map, zoom]);

  return null;
}

export default function LeafletMap({ vehicles, center = [33.8869, 9.5375], zoom = 7, focusPositions, className }: MapProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className={className} style={{ height: '100%', width: '100%' }}>
      <MapFocusController focusPositions={focusPositions} center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={isDark 
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />
      {vehicles.map((vehicle) => (
        vehicle.location && (
          <Marker 
            key={vehicle.id} 
            position={[vehicle.location.lat, vehicle.location.lng]}
            icon={getIcon(vehicle.status)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{vehicle.model}</h3>
                  <Badge variant={
                    vehicle.status === 'AVAILABLE' ? 'default' : 
                    vehicle.status === 'BOOKED' ? 'secondary' : 
                    'destructive'
                  }>
                    {vehicle.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-mono text-xs text-muted-foreground">{vehicle.plateNumber}</p>
                  
                  <div className="flex items-center gap-2">
                    <Battery className={`h-4 w-4 ${
                      (vehicle.batteryLevel || 0) < 20 ? 'text-red-500' : 'text-green-500'
                    }`} />
                    <span>{vehicle.batteryLevel}% Battery</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-blue-500" />
                    <span>{vehicle.currentSpeed} km/h</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated: {vehicle.lastUpdate ? format(new Date(vehicle.lastUpdate), 'HH:mm:ss') : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}
