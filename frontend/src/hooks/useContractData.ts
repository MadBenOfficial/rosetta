'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Brief, Stats, fetchBriefs, fetchStats, IS_DEPLOYED } from '@/lib/contract';

const POLL_MS = 90_000;

export function useContractData() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastLoaded, setLastLoaded] = useState<number>(0);

  const alive = useRef(true);
  const txInFlight = useRef(false);

  const load = useCallback(async (showLoading = false) => {
    if (!IS_DEPLOYED) {
      setLoading(false);
      setError('not-deployed');
      return;
    }
    if (txInFlight.current) return;
    if (showLoading) setLoading(true);
    try {
      const list = await fetchBriefs(0);
      if (!alive.current) return;
      setBriefs(list);
      setError(null);
      setLastLoaded(Date.now());
      try {
        const s = await fetchStats();
        if (alive.current) setStats(s);
      } catch {
        // derive client-side as a fallback
        if (alive.current) {
          setStats({
            briefs: list.length,
            reconciled: list.filter((b) => b.status === 'RECONCILED').length,
          });
        }
      }
    } catch (e) {
      if (alive.current) setError(String((e as { message?: string })?.message ?? e));
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load(true);
    const id = setInterval(() => load(false), POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load]);

  const setTxInFlight = useCallback((v: boolean) => {
    txInFlight.current = v;
  }, []);

  const derivedStats = useMemo<Stats>(() => {
    if (stats) return stats;
    return {
      briefs: briefs.length,
      reconciled: briefs.filter((b) => b.status === 'RECONCILED').length,
    };
  }, [stats, briefs]);

  return {
    briefs,
    stats: derivedStats,
    loading,
    error,
    lastLoaded,
    reload: load,
    setTxInFlight,
  };
}
