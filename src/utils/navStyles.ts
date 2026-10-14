import { cn } from './cn';

export type InteractionState = 'default' | 'hover' | 'focus' | 'active';

export type StateStyles = {
  base: string;
  /** Live pseudo-class styles used by real controls */
  interactive: string;
  /** Static equivalents used to render forced states in the spec */
  hover: string;
  focus: string;
  active: string;
};

/**
 * Returns live interactive classes when no state is given,
 * or a static snapshot of one state for documentation.
 */
export function withState(styles: StateStyles, state?: InteractionState): string {
  if (!state) return cn(styles.base, styles.interactive);
  if (state === 'default') return styles.base;
  return cn(styles.base, styles[state]);
}

const focusRing =
'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400';
const focusRingStatic = 'outline outline-2 outline-offset-2 outline-aqua-400';

export const logoStyles: StateStyles = {
  base: 'inline-flex h-11 items-center rounded-button px-2 font-heading font-semibold text-on-dark transition-control duration-150',
  interactive: `hover:bg-on-dark/5 active:bg-on-dark/10 ${focusRing}`,
  hover: 'bg-on-dark/5',
  focus: focusRingStatic,
  active: 'bg-on-dark/10'
};

export const navLinkStyles: StateStyles = {
  base: 'relative inline-flex h-11 items-center whitespace-nowrap rounded-button px-3 font-sans text-body font-medium text-muted-on-dark transition-control duration-150',
  interactive: `hover:bg-on-dark/5 hover:text-on-dark active:bg-on-dark/10 active:text-on-dark ${focusRing}`,
  hover: 'bg-on-dark/5 text-on-dark',
  focus: focusRingStatic,
  active: 'bg-on-dark/10 text-on-dark'
};

export const chevronButtonStyles: StateStyles = {
  base: 'inline-flex h-11 w-11 items-center justify-center rounded-button text-muted-on-dark transition-control duration-150 aria-expanded:bg-on-dark/5 aria-expanded:text-on-dark',
  interactive: `hover:bg-on-dark/5 hover:text-on-dark active:bg-on-dark/10 active:text-on-dark ${focusRing}`,
  hover: 'bg-on-dark/5 text-on-dark',
  focus: focusRingStatic,
  active: 'bg-on-dark/10 text-on-dark'
};

export const primaryButtonStyles: StateStyles = {
  base: 'inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-button bg-aqua-400 px-4 font-sans text-button font-semibold text-ink-950 shadow-glow transition-control duration-150',
  interactive: `hover:bg-aqua-400/90 hover:shadow-glow-strong active:translate-y-px active:bg-aqua-400/80 active:shadow-none ${focusRing}`,
  hover: 'bg-aqua-400/90 shadow-glow-strong',
  focus: focusRingStatic,
  active: 'translate-y-px bg-aqua-400/80 shadow-none'
};

export const compactButtonStyles: StateStyles = {
  base: 'inline-flex h-11 items-center justify-center whitespace-nowrap rounded-button bg-aqua-400 px-3 font-sans text-small font-semibold text-ink-950 shadow-glow transition-control duration-150',
  interactive: primaryButtonStyles.interactive,
  hover: primaryButtonStyles.hover,
  focus: focusRingStatic,
  active: primaryButtonStyles.active
};

export const menuButtonStyles: StateStyles = {
  base: 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-button border border-hairline-dark text-on-dark transition-control duration-150',
  interactive: `hover:bg-on-dark/5 active:bg-on-dark/10 ${focusRing}`,
  hover: 'bg-on-dark/5',
  focus: focusRingStatic,
  active: 'bg-on-dark/10'
};

export const dropdownItemStyles: StateStyles = {
  base: 'flex h-full items-start gap-4 rounded-card p-4 transition-control duration-150',
  interactive: `hover:bg-on-dark/5 active:bg-on-dark/10 ${focusRing}`,
  hover: 'bg-on-dark/5',
  focus: focusRingStatic,
  active: 'bg-on-dark/10'
};

export const viewAllLinkStyles: StateStyles = {
  base: 'inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-button px-3 font-sans text-body font-semibold text-indigo-400 underline-offset-4 transition-control duration-150',
  interactive: `hover:underline active:bg-on-dark/10 active:underline ${focusRing}`,
  hover: 'underline',
  focus: focusRingStatic,
  active: 'bg-on-dark/10 underline'
};

export const sheetItemStyles: StateStyles = {
  base: 'relative flex h-14 w-full items-center rounded-button px-4 font-heading text-h4 font-medium text-on-dark transition-control duration-150',
  interactive: `hover:bg-on-dark/5 active:bg-on-dark/10 ${focusRing}`,
  hover: 'bg-on-dark/5',
  focus: focusRingStatic,
  active: 'bg-on-dark/10'
};

export const sheetChevronStyles: StateStyles = {
  base: 'inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-button border border-hairline-dark text-on-dark transition-control duration-150 aria-expanded:bg-on-dark/5',
  interactive: `hover:bg-on-dark/5 active:bg-on-dark/10 ${focusRing}`,
  hover: 'bg-on-dark/5',
  focus: focusRingStatic,
  active: 'bg-on-dark/10'
};

export const sheetSubItemStyles: StateStyles = {
  base: 'flex w-full items-start gap-3 rounded-button p-3 transition-control duration-150',
  interactive: `hover:bg-on-dark/5 active:bg-on-dark/10 ${focusRing}`,
  hover: 'bg-on-dark/5',
  focus: focusRingStatic,
  active: 'bg-on-dark/10'
};