import { useEffect } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE =
'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
containerRef: RefObject<HTMLElement>,
active: boolean,
initialFocusRef?: RefObject<HTMLElement>)
{
  useEffect(() => {
    if (!active) return;
    const node = containerRef.current;
    if (!node) return;

    const getFocusable = () =>
    Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null
    );

    const frame = requestAnimationFrame(() => {
      (initialFocusRef?.current ?? getFocusable()[0])?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (!node.contains(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active, containerRef, initialFocusRef]);
}