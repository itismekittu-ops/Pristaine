import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Tracks scroll through a pinned section and returns the active scene.
 * Works with the window or the nearest scrolling ancestor (e.g. preview frames).
 */
export function usePinnedSteps(ref: RefObject<HTMLElement>, count: number, enabled: boolean) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Keep the prerender and first client render identical; useEffect measures the real viewport.
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const scroller = getScrollParent(el);
    const target: HTMLElement | Window = scroller ?? window;
    let frame = 0;

    const measure = () => {
      frame = 0;
      setViewportHeight(scroller ? scroller.clientHeight : window.innerHeight);
      const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const rect = el.getBoundingClientRect();
      const range = rect.height - view.height;
      const progress = range > 0 ? (view.top - rect.top) / range : 0;
      const clamped = Math.min(Math.max(progress, 0), 0.9999);
      setActiveIndex(Math.floor(clamped * count));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    target.addEventListener('scroll', schedule, { passive: true });
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
  }, [ref, count, enabled]);

  return { activeIndex, viewportHeight };
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