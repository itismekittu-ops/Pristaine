import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';

const OPEN_DELAY = 150;
const CLOSE_DELAY = 150;

type OpenReason = 'hover' | 'focus' | 'click';

type Options = {
  defaultOpen?: boolean;
  /** When true (previews), Escape only acts if focus or pointer is inside this menu */
  scoped?: boolean;
};

export function useServicesDropdown({ defaultOpen = false, scoped = false }: Options) {
  const [open, setOpen] = useState(defaultOpen);
  const openRef = useRef(defaultOpen);
  const reasonRef = useRef<OpenReason | null>(defaultOpen ? 'click' : null);
  const pointerInsideRef = useRef(false);
  const focusFirstRef = useRef(false);
  const suppressFocusOpenRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const setOpenState = useCallback((next: boolean, reason: OpenReason | null) => {
    openRef.current = next;
    reasonRef.current = next ? reason : null;
    setOpen(next);
  }, []);

  const close = useCallback(
    (returnFocus: boolean) => {
      clearTimer();
      setOpenState(false, null);
      if (returnFocus && chevronRef.current) {
        suppressFocusOpenRef.current = true;
        chevronRef.current.focus();
      }
    },
    [clearTimer, setOpenState]
  );

  const scheduleOpen = (reason: OpenReason) => {
    clearTimer();
    if (openRef.current) return;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      setOpenState(true, reason);
    }, OPEN_DELAY);
  };

  const scheduleClose = () => {
    clearTimer();
    if (!openRef.current) return;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      setOpenState(false, null);
    }, CLOSE_DELAY);
  };

  const getItems = () =>
  Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? []);

  const onPointerEnter = (event: React.PointerEvent) => {
    pointerInsideRef.current = true;
    if (event.pointerType !== 'mouse') return;
    scheduleOpen('hover');
  };

  const onPointerLeave = (event: React.PointerEvent) => {
    pointerInsideRef.current = false;
    if (event.pointerType !== 'mouse') return;
    if (!openRef.current || reasonRef.current === 'hover') scheduleClose();
  };

  const onFocusWithin = () => {
    if (openRef.current && reasonRef.current === 'hover') reasonRef.current = 'focus';
  };

  const onBlurWithin = (event: React.FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && wrapperRef.current?.contains(next)) return;
    if (pointerInsideRef.current) return;
    if (openRef.current) close(false);else
    clearTimer();
  };

  const onChevronFocus = () => {
    if (suppressFocusOpenRef.current) {
      suppressFocusOpenRef.current = false;
      return;
    }
    scheduleOpen('focus');
  };

  const onChevronClick = () => {
    clearTimer();
    if (openRef.current && reasonRef.current === 'click') close(false);else
    setOpenState(true, 'click');
  };

  const onChevronKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    clearTimer();
    if (openRef.current) {
      getItems()[0]?.focus();
    } else {
      focusFirstRef.current = true;
      setOpenState(true, 'click');
    }
  };

  const onPanelKeyDown = (event: React.KeyboardEvent) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const items = getItems();
    if (items.length === 0) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next = 0;
    if (event.key === 'ArrowDown') next = index < 0 ? 0 : (index + 1) % items.length;
    if (event.key === 'ArrowUp') next = index <= 0 ? items.length - 1 : index - 1;
    if (event.key === 'End') next = items.length - 1;
    items[next]?.focus();
  };

  useEffect(() => {
    if (!open || !focusFirstRef.current) return;
    focusFirstRef.current = false;
    const frame = requestAnimationFrame(() => getItems()[0]?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const wrapper = wrapperRef.current;
      const inside = !!wrapper?.contains(document.activeElement) || pointerInsideRef.current;
      if (scoped && !inside) return;
      close(true);
    };
    const onPointerDown = (event: PointerEvent) => {
      const wrapper = wrapperRef.current;
      if (!wrapper || wrapper.contains(event.target as Node)) return;
      close(wrapper.contains(document.activeElement));
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, scoped, close]);

  useEffect(() => clearTimer, [clearTimer]);

  return {
    open,
    close,
    wrapperRef,
    chevronRef,
    panelRef,
    onPointerEnter,
    onPointerLeave,
    onFocusWithin,
    onBlurWithin,
    onChevronFocus,
    onChevronClick,
    onChevronKeyDown,
    onPanelKeyDown
  };
}