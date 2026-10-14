import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import type { RefObject } from 'react';

type Viewport = {width: number;height: number;};

type Options = {
  /** Listen to scroll and update progress */
  enabled: boolean;
  /** The sticky stage is at least this tall, which shortens the pinned range */
  minStageHeight: number;
};

/**
 * Maps scroll through a tall track (with a sticky stage inside) to a 0–1 progress value.
 * Works with the window or the nearest scrolling ancestor (e.g. scaled preview frames).
 */
export function useScrollTrack(ref: RefObject<HTMLElement>, { enabled, minStageHeight }: Options) {
  const progress = useMotionValue(0);
  const scrollerRef = useRef<HTMLElement | null>(null);
  // Deterministic server/client first render; the effect measures the real viewport.
  const [viewport, setViewport] = useState<Viewport>({ width: 1280, height: 800 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scroller = getScrollParent(el);
    scrollerRef.current = scroller;
    const target: HTMLElement | Window = scroller ?? window;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const height = scroller ? scroller.clientHeight : window.innerHeight;
      const width = el.offsetWidth;
      setViewport((prev) => prev.width === width && prev.height === height ? prev : { width, height });
      if (!enabled) return;
      const { offset, range } = readGeometry(el, scroller, minStageHeight);
      progress.set(range > 0 ? Math.min(Math.max(offset / range, 0), 1) : 0);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    if (enabled) target.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    if (scroller) observer.observe(scroller);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      target.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [ref, enabled, minStageHeight, progress]);

  /** Scrolls the page so the track sits at the given progress */
  const scrollToProgress = useCallback(
    (value: number) => {
      const el = ref.current;
      if (!el) return;
      const scroller = scrollerRef.current;
      const { offset, range } = readGeometry(el, scroller, minStageHeight);
      const scrollTop = scroller ? scroller.scrollTop : window.scrollY;
      const top = scrollTop - offset + Math.min(Math.max(value, 0), 1) * Math.max(range, 0);
      (scroller ?? window).scrollTo({ top, behavior: 'smooth' });
    },
    [ref, minStageHeight]
  );

  return { progress, viewport, scrollToProgress };
}

function readGeometry(el: HTMLElement, scroller: HTMLElement | null, minStageHeight: number) {
  const rect = el.getBoundingClientRect();
  const scale = el.offsetHeight > 0 ? rect.height / el.offsetHeight : 1;
  const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
  const viewHeight = scroller ? scroller.clientHeight : window.innerHeight;
  return {
    offset: (viewTop - rect.top) / scale,
    range: el.offsetHeight - Math.max(viewHeight, minStageHeight)
  };
}

function getScrollParent(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}