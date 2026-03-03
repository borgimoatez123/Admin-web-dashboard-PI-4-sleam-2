'use client';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

export type Coords = { lat: number; lng: number };

type AgencyMapPickerProps = {
  center: Coords;
  zoom: number;
  value?: Coords | null;
  onPick: (coords: Coords, city: string) => void;
  nearestState: (coords: Coords) => string;
  className?: string;
  centerOverride?: Coords | null;
  readOnly?: boolean;
  markerType?: 'default' | 'home';
};

function ClickHandler({ onPick, nearestState }: { onPick: AgencyMapPickerProps['onPick']; nearestState: AgencyMapPickerProps['nearestState'] }) {
  useMapEvents({
    click: (e) => {
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
      const city = nearestState(coords);
      onPick(coords, city);
    },
  });
  return null;
}

function Centerer({ to }: { to: Coords | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!to) return;
    map.flyTo([to.lat, to.lng], map.getZoom(), { animate: true, duration: 0.6 });
  }, [map, to]);
  return null;
}

const homeIcon = L.divIcon({
  className: '',
  html: `<div style="width:32px;height:32px;transform:translate(-16px,-32px);">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10.5L12 3l9 7.5" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 10.5V21h14V10.5" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 21v-6h4v6" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 3l9 7.5" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function AgencyMapPicker({ center, zoom, value, onPick, nearestState, className, centerOverride, readOnly, markerType = 'default' }: AgencyMapPickerProps) {
  const markerProps = markerType === 'home' ? { icon: homeIcon } : {};
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: 8 }}
      className={className}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Centerer to={centerOverride} />
      {readOnly ? null : <ClickHandler onPick={onPick} nearestState={nearestState} />}
      {value ? <Marker position={[value.lat, value.lng]} {...markerProps} /> : null}
    </MapContainer>
  );
}
