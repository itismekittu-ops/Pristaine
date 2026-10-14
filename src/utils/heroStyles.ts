import type { StateStyles } from './navStyles';

const focusRing =
'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400';
const focusRingStatic = 'outline outline-2 outline-offset-2 outline-aqua-400';

/** Focus ring is applied from input focus state (see ChatBar), not focus-within. */
export const chatBarStyles: StateStyles = {
  base: 'flex w-full items-center gap-2 rounded-pill border-1.5 border-border-dark bg-ink-900 transition-control duration-150',
  interactive: 'hover:border-muted-on-dark',
  hover: 'border-muted-on-dark',
  focus: `border-muted-on-dark ${focusRingStatic}`,
  active: 'border-muted-on-dark'
};

export const submitButtonStyles: StateStyles = {
  base: 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-aqua-400 text-ink-950 transition-control duration-150',
  interactive: `hover:bg-aqua-400/90 active:translate-y-px active:bg-aqua-400/80 ${focusRing}`,
  hover: 'bg-aqua-400/90',
  focus: focusRingStatic,
  active: 'translate-y-px bg-aqua-400/80'
};

/** Book a Consultation inside the chat panel: aqua fill, ink text, no glow. */
export const panelPrimaryButtonStyles: StateStyles = {
  base: 'inline-flex h-12 items-center justify-center whitespace-nowrap rounded-button bg-aqua-400 px-4 font-sans text-button font-semibold text-ink-950 transition-control duration-150',
  interactive: `hover:bg-aqua-400/90 active:translate-y-px active:bg-aqua-400/80 ${focusRing}`,
  hover: 'bg-aqua-400/90',
  focus: focusRingStatic,
  active: 'translate-y-px bg-aqua-400/80'
};

/** Secondary: 1px outline. */
export const secondaryButtonStyles: StateStyles = {
  base: 'inline-flex h-12 items-center justify-center whitespace-nowrap rounded-button border border-border-dark px-4 font-sans text-button font-semibold text-on-dark transition-control duration-150',
  interactive: `hover:border-muted-on-dark hover:bg-on-dark/5 active:translate-y-px active:bg-on-dark/10 aria-disabled:cursor-not-allowed ${focusRing}`,
  hover: 'border-muted-on-dark bg-on-dark/5',
  focus: focusRingStatic,
  active: 'translate-y-px bg-on-dark/10'
};

export const emailFieldClasses =
'h-12 w-full rounded-field border border-border-dark bg-ink-900 px-4 text-body text-on-dark placeholder:text-muted-on-dark transition-control duration-150 hover:border-muted-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400 aria-invalid:border-error-dark';

export const privacyLinkStyles: StateStyles = {
  base: '-my-3 inline-block rounded-field py-3 font-medium text-indigo-400 underline underline-offset-4 transition-control duration-150',
  interactive: `hover:text-on-dark hover:decoration-2 active:bg-on-dark/10 active:text-on-dark ${focusRing}`,
  hover: 'text-on-dark decoration-2',
  focus: focusRingStatic,
  active: 'bg-on-dark/10 text-on-dark'
};