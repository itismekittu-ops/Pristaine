import { useEffect, useState } from 'react';

/** Advances an index on an interval while active; loops back to 0. */
export function useRotatingIndex(count: number, active: boolean, intervalMs: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearInterval(id);
  }, [active, count, intervalMs]);

  return index;
}