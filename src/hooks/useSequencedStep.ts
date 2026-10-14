import { useEffect, useState } from 'react';
import { DURATION } from '../utils/motion';

/**
 * Sequences a step change: the outgoing step fades out first, and only then does
 * the incoming step become the shown one, so two steps are never visible together.
 * With `instant`, the swap happens immediately.
 */
export function useSequencedStep(active: number, instant: boolean) {
  const [shown, setShown] = useState(active);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (active === shown && visible) return;
    if (instant) {
      setShown(active);
      setVisible(true);
      return;
    }
    setVisible(false);
    const timer = window.setTimeout(() => {
      setShown(active);
      setVisible(true);
    }, DURATION.stepOut * 1000);
    return () => window.clearTimeout(timer);
    // Only a change of the target step (or motion setting) restarts the sequence
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, instant]);

  return { shown, visible };
}