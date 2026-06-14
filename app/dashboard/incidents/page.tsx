'use client';

import { useEffect, useState } from 'react';
import { getDamages, Damage } from '@/services/damageService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  MapPin,
  Loader2,
  RefreshCw,
  Gauge,
  Zap,
  Clock,
  Ruler,
  Weight,
  Satellite,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';

const degatConfig: Record<string, { label: string; color: string; border: string; badge: string }> = {
  GRAVE: {
    label: 'Severe',
    color: 'text-red-500',
    border: 'border-l-red-500',
    badge: 'bg-red-500/10 text-red-500 border-red-500/30',
  },
  MODERE: {
    label: 'Moderate',
    color: 'text-orange-500',
    border: 'border-l-orange-500',
    badge: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  },
  LEGER: {
    label: 'Minor',
    color: 'text-yellow-500',
    border: 'border-l-yellow-500',
    badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  },
};

function getDegatConfig(degat: string) {
  return degatConfig[degat?.toUpperCase()] ?? degatConfig['GRAVE'];
}

/**
 * Damage % = how much force exceeded the threshold × structural compression ratio
 * Clamped to [0, 100]
 */
function calcDamagePercent(d: Damage): number {
  if (d.seuil_N <= 0 || d.distance_debut_mm <= 0) return 0;
  const forceRatio = d.force_N / d.seuil_N;                          // e.g. 14.9x threshold
  const compressionRatio = d.delta_distance_mm / d.distance_debut_mm; // 0–1 structural crush
  const raw = forceRatio * compressionRatio * 10;                     // scale to 0–100 range
  return Math.min(100, Math.max(0, Math.round(raw)));
}

function DamageBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground uppercase tracking-wide font-medium">Damage Score</span>
        <span className={`font-bold text-sm ${color}`}>{percent}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percent >= 80 ? 'bg-red-500' : percent >= 50 ? 'bg-orange-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function IncidentsPage() {
  const [damages, setDamages] = useState<Damage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDamages = async () => {
    setLoading(true);
    const data = await getDamages();
    // newest first
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setDamages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDamages();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Incident Alerts</h2>
          <p className="text-muted-foreground">
            Real-time collision and damage events — {damages.length} recorded
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDamages}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {damages.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No damage incidents recorded yet.
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {damages.map((d, index) => {
            const cfg = getDegatConfig(d.degat);
            const damagePercent = calcDamagePercent(d);
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
              >
              <Card className={`border-l-4 ${cfg.border}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 shrink-0 ${cfg.color}`} />
                      <div>
                        <CardTitle className="text-base">
                          Collision #{index + 1}
                          <span className="ml-2 text-xs font-mono text-muted-foreground">{d.id.slice(-8)}</span>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(d.createdAt), 'PPP · HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={cfg.badge}>
                        {cfg.label}
                      </Badge>
                      <Badge variant="outline" className={d.gps_fixe ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-muted text-muted-foreground'}>
                        <Satellite className="h-3 w-3 mr-1" />
                        {d.gps_fixe ? 'GPS Fixed' : 'No GPS'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Impact metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Impact Force</p>
                      <p className={`text-xl font-bold ${cfg.color}`}>{d.force_N.toFixed(1)} N</p>
                      <p className="text-xs text-muted-foreground">Threshold: {d.seuil_N} N</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Speed at Impact</p>
                      <p className="text-xl font-bold">{d.vitesse_ms.toFixed(3)} m/s</p>
                      <p className="text-xs text-muted-foreground">{(d.vitesse_ms * 3.6).toFixed(2)} km/h</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Deformation</p>
                      <p className="text-xl font-bold">{d.delta_distance_mm.toFixed(1)} mm</p>
                      <p className="text-xs text-muted-foreground">Over {d.delta_temps_s}s</p>
                    </div>
                  </div>

                  {/* Damage percentage bar */}
                  <DamageBar percent={damagePercent} color={cfg.color} />

                  {/* Detail row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 pt-1">
                    <StatItem icon={Ruler} label="Start dist." value={`${d.distance_debut_mm} mm`} />
                    <StatItem icon={Ruler} label="End dist." value={`${d.distance_fin_mm} mm`} />
                    <StatItem icon={Weight} label="Vehicle mass" value={`${d.masse_kg} kg`} />
                    <StatItem icon={Clock} label="Start time" value={d.heure_debut} />
                    <StatItem icon={Clock} label="End time" value={d.heure_fin} />
                    <StatItem icon={Zap} label="Duration" value={`${d.delta_temps_s}s`} />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{d.location.latitude.toFixed(4)}, {d.location.longitude.toFixed(4)}</span>
                    </div>
                    <Link href="/dashboard/tracking">
                      <Button variant="outline" size="sm">
                        View on Map
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
