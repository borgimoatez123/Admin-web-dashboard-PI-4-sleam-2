'use client';

import { useEffect, useState } from 'react';
import { Incident } from '@/types';
import { getIncidents, resolveIncident } from '@/services/incidentService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert, CheckCircle, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const data = await getIncidents();
      // Sort: Unresolved first, then by date (newest first)
      const sorted = data.sort((a, b) => {
        if (a.resolved === b.resolved) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.resolved ? 1 : -1;
      });
      setIncidents(sorted);
    } catch (error) {
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await resolveIncident(id);
      toast.success('Incident marked as resolved');
      fetchIncidents();
    } catch (error) {
      toast.error('Failed to resolve incident');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Incident Alerts</h2>
        <p className="text-muted-foreground">
          Monitor and manage vehicle security incidents
        </p>
      </div>

      <div className="grid gap-4">
        {incidents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No incidents reported.
            </CardContent>
          </Card>
        ) : (
          incidents.map((incident) => (
            <Card key={incident.id} className={incident.resolved ? 'opacity-70 bg-muted/50' : 'border-l-4 border-l-red-500'}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {incident.type === 'STOLEN' ? (
                      <ShieldAlert className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    )}
                    <CardTitle className="text-lg">
                      {incident.type} ALERT - Vehicle ID: {incident.vehicleId}
                    </CardTitle>
                    {incident.resolved && (
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(incident.createdAt), 'PPP p')}
                  </div>
                </div>
                <CardDescription>
                  {incident.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Lat: {incident.location.lat}, Lng: {incident.location.lng}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/dashboard/tracking">
                      <Button variant="outline" size="sm">
                        View on Map
                      </Button>
                    </Link>
                    {!incident.resolved && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleResolve(incident.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
