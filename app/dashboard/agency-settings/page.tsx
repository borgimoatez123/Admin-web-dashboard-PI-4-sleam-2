'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser, updateAgency } from '@/services/authService';
import dynamic from 'next/dynamic';

type Coords = { lat: number; lng: number };

const TUNISIA_CENTER: Coords = { lat: 34.0, lng: 9.0 };
const DEFAULT_ZOOM = 6;

const TUNISIA_STATES_COORDS: Record<string, Coords> = {
  Tunis: { lat: 36.8065, lng: 10.1815 },
  Ariana: { lat: 36.8665, lng: 10.1647 },
  'Ben Arous': { lat: 36.7435, lng: 10.231 },
  Manouba: { lat: 36.8093, lng: 10.0955 },
  Nabeul: { lat: 36.4561, lng: 10.7376 },
  Zaghouan: { lat: 36.4029, lng: 10.1429 },
  Bizerte: { lat: 37.2746, lng: 9.8739 },
  Beja: { lat: 36.7256, lng: 9.1817 },
  Jendouba: { lat: 36.5011, lng: 8.7802 },
  Kef: { lat: 36.1826, lng: 8.7148 },
  Siliana: { lat: 36.0848, lng: 9.3708 },
  Sousse: { lat: 35.8256, lng: 10.6084 },
  Monastir: { lat: 35.7643, lng: 10.8113 },
  Mahdia: { lat: 35.5047, lng: 11.0622 },
  Sfax: { lat: 34.7406, lng: 10.7603 },
  Kairouan: { lat: 35.6781, lng: 10.0963 },
  Kasserine: { lat: 35.1676, lng: 8.8365 },
  'Sidi Bouzid': { lat: 35.0382, lng: 9.4849 },
  Gabes: { lat: 33.8815, lng: 10.0982 },
  Medenine: { lat: 33.3549, lng: 10.5055 },
  Tataouine: { lat: 32.9297, lng: 10.4518 },
  Gafsa: { lat: 34.4311, lng: 8.7757 },
  Tozeur: { lat: 33.9197, lng: 8.1335 },
  Kebili: { lat: 33.7044, lng: 8.969 },
};

const stateNames = Object.keys(TUNISIA_STATES_COORDS);
const DISPLAY_STATE_NAMES = [
  'Ariana','Béja','Ben Arous','Bizerte','Gabès','Gafsa','Jendouba','Kairouan','Kasserine','Kebili','Kef','Mahdia','Manouba','Medenine','Monastir','Nabeul','Sfax','Sidi Bouzid','Siliana','Sousse','Tataouine','Tozeur','Tunis','Zaghouan'
];

const toCoordsKey = (display: string): string => {
  const lower = display.toLowerCase();
  if (lower === 'béja') return 'Beja';
  if (lower === 'gabès') return 'Gabes';
  const matched = stateNames.find(n => n.toLowerCase() === lower);
  return matched ?? display;
};

const toDisplayName = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower === 'beja' || lower === 'béja') return 'Béja';
  if (lower === 'gabes' || lower === 'gabès') return 'Gabès';
  const matched = DISPLAY_STATE_NAMES.find(n => n.toLowerCase() === lower);
  return matched ?? name;
};

const nearestState = ({ lat, lng }: Coords): string => {
  let min = Number.POSITIVE_INFINITY;
  let nearest = stateNames[0];
  for (const name of stateNames) {
    const s = TUNISIA_STATES_COORDS[name];
    const d = Math.hypot(s.lat - lat, s.lng - lng);
    if (d < min) {
      min = d;
      nearest = name;
    }
  }
  return nearest;
};

export default function AgencySettingsPage() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [saving, setSaving] = useState(false);
  const [centerOverride, setCenterOverride] = useState<Coords | null>(null);
  const AgencyMapPicker = useMemo(
    () => dynamic(() => import('@/components/Map/AgencyMapPicker'), { ssr: false }),
    []
  );

  type AxiosErrorLike = { response?: { data?: { message?: string } } };

  const handleSave = async () => {
    if (!agencyName || !coords) {
      toast.error('Please enter agency name and pick a location on the map.');
      return;
    }
    setSaving(true);
    try {
      await updateAgency({
        agencyName,
        agencyLocation: { city, lat: coords.lat, lng: coords.lng },
      });
      toast.success('Agency updated');
      window.dispatchEvent(new Event('agency-updated'));
      router.push('/dashboard/agency-settings/overview');
    } catch (err) {
      const msg = (err as AxiosErrorLike)?.response?.data?.message ?? 'Failed to update agency';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const user = await getCurrentUser();
      if (!mounted) return;

      const edit = new URLSearchParams(window.location.search).get('edit') === '1';
      const hasData = Boolean(
        user?.agencyName &&
        user?.agencyLocation?.city &&
        typeof user?.agencyLocation?.lat === 'number' &&
        typeof user?.agencyLocation?.lng === 'number'
      );

      if (hasData && !edit) {
        router.replace('/dashboard/agency-settings/overview');
        return;
      }

      if (user?.agencyName) setAgencyName(user.agencyName);

      const cityDisplay = user?.agencyLocation?.city ? toDisplayName(String(user.agencyLocation.city)) : '';
      if (cityDisplay) setCity(cityDisplay);

      const lat = user?.agencyLocation?.lat;
      const lng = user?.agencyLocation?.lng;
      if (typeof lat === 'number' && typeof lng === 'number') {
        const c = { lat, lng };
        setCoords(c);
        setCenterOverride(c);
      } else if (cityDisplay) {
        const key = toCoordsKey(cityDisplay);
        const c = TUNISIA_STATES_COORDS[key];
        if (c) setCenterOverride(c);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Agency Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Agency Details</CardTitle>
            <CardDescription>Set agency name and location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agency Name</label>
              <Input
                placeholder="S.A.V.E.S Agency Tunis"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Select
                  value={city}
                  onValueChange={(val) => {
                    setCity(val);
                    const key = toCoordsKey(val);
                    const c = TUNISIA_STATES_COORDS[key];
                    if (c) {
                      setCenterOverride(c);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISPLAY_STATE_NAMES.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Latitude</label>
                <Input
                  placeholder="Lat"
                  value={coords?.lat ?? ''}
                  onChange={() => {}}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Longitude</label>
                <Input
                  placeholder="Lng"
                  value={coords?.lng ?? ''}
                  onChange={() => {}}
                  readOnly
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </CardContent>
        </Card>

        <Card className="h-[460px]">
          <CardHeader>
            <CardTitle>Pick Location</CardTitle>
            <CardDescription>
              {city ? `Centered on ${city}. Click on the map to pick the agency location.` : 'Select a state or click on the map to pick the agency location.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[360px]">
            <AgencyMapPicker
              center={TUNISIA_CENTER}
              zoom={DEFAULT_ZOOM}
              value={coords}
              nearestState={nearestState}
              centerOverride={centerOverride}
              onPick={(c, state) => {
                setCoords(c);
                setCity(toDisplayName(state));
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
