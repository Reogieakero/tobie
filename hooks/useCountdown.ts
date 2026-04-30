import { useEffect, useState } from 'react';

export function getRemainingMs(endTime: string | null): number {
  if (!endTime) return 0;
  return Math.max(0, new Date(endTime).getTime() - Date.now());
}

export function getStartsInMs(startTime: string | null): number {
  if (!startTime) return 0;
  return Math.max(0, new Date(startTime).getTime() - Date.now());
}

export type Urgency = 'ended' | 'critical' | 'warning' | 'normal';

export function getUrgency(ms: number): Urgency {
  if (ms <= 0)      return 'ended';
  if (ms < 60_000)  return 'critical';
  if (ms < 300_000) return 'warning';
  return 'normal';
}

export function useCountdown(endTime: string | null): number {
  const [remaining, setRemaining] = useState(() => getRemainingMs(endTime));
  useEffect(() => {
    if (!endTime) return;
    const tick = () => setRemaining(getRemainingMs(endTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return remaining;
}

export function useStartsIn(startTime: string | null): number {
  const [startsIn, setStartsIn] = useState(() => getStartsInMs(startTime));
  useEffect(() => {
    if (!startTime) return;
    const tick = () => setStartsIn(getStartsInMs(startTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  return startsIn;
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  return `${String(s).padStart(2, '0')}s`;
}

export function formatScheduledDate(startTime: string): string {
  const d = new Date(startTime);
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}