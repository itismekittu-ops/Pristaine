import type { StateStyles } from './navStyles';

const focusRing =
'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
const focusRingStatic = 'outline outline-2 outline-offset-2 outline-indigo-600';

/** Accordion question: full-width button, at least 64px high */
export const faqTriggerStyles: StateStyles = {
  base: 'flex min-h-[64px] w-full items-center justify-between gap-4 rounded-field px-4 py-3 text-left font-heading font-medium text-on-light transition-colors duration-150 ease-brand',
  interactive: `hover:bg-on-light/5 active:bg-on-light/10 ${focusRing}`,
  hover: 'bg-on-light/5',
  focus: focusRingStatic,
  active: 'bg-on-light/10'
};

/** Info (i) button: 20px glyph inside a 44px target */
export const faqInfoButtonStyles: StateStyles = {
  base: 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-on-light transition-colors duration-150 ease-brand aria-expanded:bg-on-light/5',
  interactive: `hover:bg-on-light/5 active:bg-on-light/10 ${focusRing}`,
  hover: 'bg-on-light/5',
  focus: focusRingStatic,
  active: 'bg-on-light/10'
};