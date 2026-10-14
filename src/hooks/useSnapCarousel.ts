import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';

type CarouselState = {index: number;atStart: boolean;atEnd: boolean;};

/** Tracks the centred item of a horizontal scroll-snap list and scrolls items to the centre. */
export function useSnapCarousel(ref: RefObject<HTMLElement>, reduced: boolean) {
  const [state, setState] = useState<CarouselState>({ index: 0, atStart: true, atEnd: false });

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const center = list.scrollLeft + list.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      Array.from(list.children).forEach((child, i) => {
        const el = child as HTMLElement;
        const distance = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
        if (distance < best) {
          best = distance;
          nearest = i;
        }
      });
      const max = list.scrollWidth - list.clientWidth;
      const next = { index: nearest, atStart: list.scrollLeft <= 1, atEnd: list.scrollLeft >= max - 1 };
      setState((prev) =>
      prev.index === next.index && prev.atStart === next.atStart && prev.atEnd === next.atEnd ? prev : next
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    list.addEventListener('scroll', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(list);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      list.removeEventListener('scroll', schedule);
      observer.disconnect();
    };
  }, [ref]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const list = ref.current;
      if (!list) return;
      const clamped = Math.max(0, Math.min(index, list.children.length - 1));
      const child = list.children[clamped] as HTMLElement | undefined;
      if (!child) return;
      list.scrollTo({
        left: child.offsetLeft - (list.clientWidth - child.offsetWidth) / 2,
        behavior: reduced ? 'auto' : 'smooth'
      });
    },
    [ref, reduced]
  );

  return { ...state, scrollToIndex };
}