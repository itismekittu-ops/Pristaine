import type { StateStyles } from './navStyles';

const focusRing =
'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400';
const focusRingStatic = 'outline outline-2 outline-offset-2 outline-aqua-400';

/** Accept all, Reject non-essential, Manage choices, Save choices: one style, one size, equal weight */
export const cookieButtonStyles: StateStyles = {
  base: 'inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-button border border-border-dark px-4 font-sans text-small font-semibold text-on-dark transition-control duration-150',
  interactive: `hover:border-muted-on-dark hover:bg-on-dark/5 active:bg-on-dark/10 ${focusRing}`,
  hover: 'border-muted-on-dark bg-on-dark/5',
  focus: focusRingStatic,
  active: 'bg-on-dark/10'
};

/** Standalone text link with a 44px target (Cookie details, Open in new tab) */
export const cookieTextLinkStyles: StateStyles = {
  base: 'inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-button font-sans text-small font-medium text-on-dark underline decoration-border-dark underline-offset-4 transition-control duration-150',
  interactive: `hover:decoration-on-dark hover:decoration-2 active:text-muted-on-dark ${focusRing}`,
  hover: 'decoration-on-dark decoration-2',
  focus: focusRingStatic,
  active: 'text-muted-on-dark decoration-on-dark decoration-2'
};

/** Link inside a sentence (Calendly's privacy policy) */
export const cookieInlineLinkStyles: StateStyles = {
  base: 'rounded-[2px] font-medium text-on-dark underline decoration-border-dark underline-offset-4 transition-control duration-150',
  interactive: `hover:decoration-on-dark hover:decoration-2 active:text-muted-on-dark ${focusRing}`,
  hover: 'decoration-on-dark decoration-2',
  focus: focusRingStatic,
  active: 'text-muted-on-dark decoration-on-dark decoration-2'
};

/** Close button in the panel and the Calendly notice */
export const cookieIconButtonStyles: StateStyles = {
  base: 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-button text-muted-on-dark transition-control duration-150',
  interactive: `hover:bg-on-dark/5 hover:text-on-dark active:bg-on-dark/10 active:text-on-dark ${focusRing}`,
  hover: 'bg-on-dark/5 text-on-dark',
  focus: focusRingStatic,
  active: 'bg-on-dark/10 text-on-dark'
};

/** Footer links and the Cookie settings control: underline on hover, not colour alone */
export const footerLinkStyles: StateStyles = {
  base: 'inline-flex min-h-11 items-center gap-2 rounded-button text-left font-sans text-body text-muted-on-dark underline-offset-4 transition-control duration-150',
  interactive: `hover:text-on-dark hover:underline active:text-on-dark active:underline active:decoration-2 ${focusRing}`,
  hover: 'text-on-dark underline',
  focus: focusRingStatic,
  active: 'text-on-dark underline decoration-2'
};