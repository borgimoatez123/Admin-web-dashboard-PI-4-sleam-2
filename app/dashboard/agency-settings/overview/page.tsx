'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/services/authService';
import { Loader2, Pencil } from 'lucide-react';
import { User } from '@/types';
import dynamic from 'next/dynamic';

const hasAgencyDetails = (u: User | null): boolean => {
  const city = u?.agencyLocation?.city;
  const lat = u?.agencyLocation?.lat;
  const lng = u?.agencyLocation?.lng;
  return Boolean(u?.agencyName && city && typeof lat === 'number' && typeof lng === 'number');
};

type Coords = { lat: number; lng: number };
const TUNISIA_CENTER: Coords = { lat: 34.0, lng: 9.0 };

export default function AgencyOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const AgencyMapPicker = useMemo(
    () =>
      dynamic(() => import('@/components/Map/AgencyMapPicker'), {
        ssr: false,
        loading: () => (
          <div className="flex h-full w-full items-center justify-center bg-muted/20 rounded-lg border">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ),
      }),
    []
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const u = await getCurrentUser();
      if (!mounted) return;
      if (!hasAgencyDetails(u)) {
        router.replace('/dashboard/agency-settings');
        return;
      }
      setUser(u);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const agencyName = user?.agencyName ?? '';
  const city = user?.agencyLocation?.city ?? '';
  const lat = user?.agencyLocation?.lat;
  const lng = user?.agencyLocation?.lng;
  const coords: Coords | null = typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Agency Settings</h2>
        <Button onClick={() => router.push('/dashboard/agency-settings?edit=1')}>
          <Pencil className="mr-2 h-4 w-4" />
          Update
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Agency Details</CardTitle>
          <CardDescription>Saved agency name and location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Agency Name</div>
              <div className="text-base font-semibold">{agencyName}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">City</div>
              <div className="text-base font-semibold">{city}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-[420px]">
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Saved agency location</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <AgencyMapPicker
            center={coords ?? TUNISIA_CENTER}
            zoom={coords ? 13 : 6}
            value={coords}
            centerOverride={coords}
            readOnly
            markerType="home"
            nearestState={() => ''}
            onPick={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}
