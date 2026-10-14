import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValue, useMotionValueEvent, useSpring } from 'framer-motion';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import type { MotionValue } from 'framer-motion';
import type { CursorMode } from '../types/insight';

/** Slight lag, no overshoot (damping ratio > 1) */
const CURSOR_SPRING = { stiffness: 380, damping: 36, mass: 0.6 };

/**
 * Drives the custom Read cursor over the pinned stage. Re-checks what is under a
 * stationary mouse whenever the track moves or the page scrolls.
 */
export function useReadCursor(
stageRef: RefObject<HTMLElement>,
enabled: boolean,
trackX: MotionValue<number>)
{
  const pointer = useRef({ clientX: 0, clientY: 0, inside: false });
  const frame = useRef(0);
  const [mode, setMode] = useState<CursorMode>('hidden');
  const [pressed, setPressed] = useState(false);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, CURSOR_SPRING);
  const y = useSpring(rawY, CURSOR_SPRING);

  const toLocal = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return { x: 0, y: 0 };
      const rect = stage.getBoundingClientRect();
      const scale = stage.offsetWidth > 0 ? rect.width / stage.offsetWidth : 1;
      return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
    },
    [stageRef]
  );

  const resolve = useCallback(() => {
    frame.current = 0;
    const stage = stageRef.current;
    const p = pointer.current;
    if (!stage || !p.inside) {
      setMode('hidden');
      return;
    }
    const local = toLocal(p.clientX, p.clientY);
    rawX.set(local.x);
    rawY.set(local.y);
    setMode(modeFor(document.elementFromPoint(p.clientX, p.clientY), stage));
  }, [stageRef, toLocal, rawX, rawY]);

  const schedule = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(resolve);
  }, [resolve]);

  useMotionValueEvent(trackX, 'change', () => {
    if (enabled && pointer.current.inside) schedule();
  });

  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => {
      if (pointer.current.inside) schedule();
    };
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [enabled, schedule]);

  const isMouse = (e: ReactPointerEvent) => enabled && e.pointerType === 'mouse';

  const handlers = {
    onPointerEnter: (e: ReactPointerEvent) => {
      if (!isMouse(e)) return;
      pointer.current = { clientX: e.clientX, clientY: e.clientY, inside: true };
      const local = toLocal(e.clientX, e.clientY);
      rawX.set(local.x);
      rawY.set(local.y);
      x.jump(local.x);
      y.jump(local.y);
      schedule();
    },
    onPointerMove: (e: ReactPointerEvent) => {
      if (!isMouse(e)) return;
      pointer.current = { clientX: e.clientX, clientY: e.clientY, inside: true };
      schedule();
    },
    onPointerLeave: (e: ReactPointerEvent) => {
      if (!isMouse(e)) return;
      pointer.current.inside = false;
      setPressed(false);
      setMode('hidden');
    },
    onPointerDown: (e: ReactPointerEvent) => {
      if (isMouse(e)) setPressed(true);
    },
    onPointerUp: (e: ReactPointerEvent) => {
      if (isMouse(e)) setPressed(false);
    }
  };

  return { mode, pressed, x, y, handlers };
}

function modeFor(hit: Element | null, stage: HTMLElement): CursorMode {
  if (!hit || !stage.contains(hit)) return 'hidden';
  if (hit.closest('[data-cursor="hide"]')) return 'hidden';
  if (hit.closest('[data-cursor="native"]')) return 'dot';
  if (hit.closest('[data-cursor="read"]')) return 'read';
  return 'hidden';
}