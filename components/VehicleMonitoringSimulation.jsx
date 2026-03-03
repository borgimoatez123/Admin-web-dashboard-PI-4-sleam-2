'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));

export default function VehicleMonitoringSimulation({ vehicle }) {
  const [speed, setSpeed] = useState(64);
  const [battery, setBattery] = useState(92);
  const [drivingMode, setDrivingMode] = useState('Auto');
  const [fatigue, setFatigue] = useState(28);
  const [distraction, setDistraction] = useState(18);
  const [aggressiveScore, setAggressiveScore] = useState(22);
  const [speedHistory, setSpeedHistory] = useState(() =>
    Array.from({ length: 16 }, (_, i) => ({ t: i + 1, speed: randInt(35, 90) }))
  );

  const lastSpeedRef = useRef(speed);
  const intervalRef = useRef(null);

  const status = useMemo(() => {
    if (fatigue > 75) return 'Dangerous';
    if (distraction > 70) return 'Dangerous';
    if (speed > 100) return 'Warning';
    return 'Safe';
  }, [distraction, fatigue, speed]);

  const statusClasses = useMemo(() => {
    if (status === 'Dangerous') return 'bg-red-500/15 text-red-200 border-red-500/30';
    if (status === 'Warning') return 'bg-amber-500/15 text-amber-200 border-amber-500/30';
    return 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30';
  }, [status]);

  const barColor = (value) => {
    if (value >= 75) return 'bg-red-500';
    if (value >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const newSpeed = randInt(20, 120);
      const newBattery = clamp(battery - rand(0.15, 0.6), 0, 100);
      const newFatigue = clamp(fatigue + rand(-4, 6), 0, 100);
      const newDistraction = clamp(distraction + rand(-5, 7), 0, 100);

      const lastSpeed = lastSpeedRef.current;
      const delta = Math.abs(newSpeed - lastSpeed);
      const newAggressive = clamp(aggressiveScore * 0.75 + delta * 0.35 + rand(0, 8), 0, 100);

      lastSpeedRef.current = newSpeed;

      setSpeed(newSpeed);
      setBattery(newBattery);
      setFatigue(newFatigue);
      setDistraction(newDistraction);
      setAggressiveScore(newAggressive);

      setSpeedHistory((prev) => {
        const nextT = (prev.at(-1)?.t ?? 0) + 1;
        const next = [...prev, { t: nextT, speed: newSpeed }];
        return next.length > 24 ? next.slice(-24) : next;
      });

      if (Math.random() < 0.08) {
        setDrivingMode((m) => (m === 'Auto' ? 'Manual' : 'Auto'));
      }
    }, 1200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [aggressiveScore, battery, distraction, fatigue]);

  const title = vehicle?.plateNumber ? `${vehicle.plateNumber}` : 'Vehicle';
  const subtitle = vehicle?.model ? `${vehicle.model}${vehicle?.city ? ` • ${vehicle.city}` : ''}` : 'Simulation';

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-white/10 bg-background/40 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">
              Live Vehicle Monitoring (Simulation Mode)
            </h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {title} • {subtitle}
            </p>
          </div>
          <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses}`}>
            {status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Vehicle Status</p>
              <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-muted-foreground">
                {drivingMode}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] text-muted-foreground">Speed</p>
                <p className="mt-1 text-xl font-bold text-foreground">{speed}</p>
                <p className="text-[11px] text-muted-foreground">km/h</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] text-muted-foreground">Battery</p>
                <p className="mt-1 text-xl font-bold text-foreground">{Math.round(battery)}</p>
                <p className="text-[11px] text-muted-foreground">%</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] text-muted-foreground">Mode</p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {drivingMode === 'Auto' ? 'Auto' : 'Manual'}
                </p>
                <p className="text-[11px] text-muted-foreground">drive</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Driver Behavior</p>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Fatigue Level</span>
                  <span className="font-semibold text-foreground">{Math.round(fatigue)}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${barColor(fatigue)}`}
                    style={{ width: `${clamp(fatigue, 0, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Distraction Level</span>
                  <span className="font-semibold text-foreground">{Math.round(distraction)}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${barColor(distraction)}`}
                    style={{ width: `${clamp(distraction, 0, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Aggressive Driving Score</p>
                  <p className="text-sm font-bold text-foreground">{Math.round(aggressiveScore)}</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${barColor(aggressiveScore)}`}
                    style={{ width: `${clamp(aggressiveScore, 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Speed Chart</p>
              <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-muted-foreground">
                live
              </span>
            </div>

            <div className="mt-4 h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={speedHistory}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="t" hide />
                  <YAxis domain={[0, 140]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={30} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.6)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      color: 'white',
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="rgba(59,130,246,0.9)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

