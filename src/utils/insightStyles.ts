import type { StateStyles } from './navStyles';

export const insightCardStyles: StateStyles = {
  base: 'group relative isolate block h-full w-full overflow-hidden bg-ink-900 text-left focus-visible:outline-none',
  interactive: '',
  hover: '',
  focus: '',
  active: ''
};

/** Pressed feedback: a light ink wash over the image */
export const insightPressStyles: StateStyles = {
  base: 'pointer-events-none absolute inset-0 -z-10 bg-ink-950/0 transition-colors duration-150',
  interactive: 'group-active:bg-ink-950/20',
  hover: '',
  focus: '',
  active: 'bg-ink-950/20'
};

/** Focus ring drawn inside the card so neighbouring cards never cover it: white on the dark image */
export const insightFocusRingStyles: StateStyles = {
  base: 'pointer-events-none absolute inset-2 rounded-field',
  interactive:
  'group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-white',
  hover: '',
  focus: 'outline outline-2 outline-offset-2 outline-white',
  active: ''
};

export const outlineButtonStyles: StateStyles = {
  base: 'inline-flex h-12 items-center justify-center whitespace-nowrap rounded-button border border-indigo-600 bg-transparent px-6 font-sans text-button font-semibold text-indigo-600 transition-control duration-150',
  interactive:
  'hover:bg-indigo-600/5 active:translate-y-px active:bg-indigo-600/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  hover: 'bg-indigo-600/5',
  focus: 'outline outline-2 outline-offset-2 outline-indigo-600',
  active: 'translate-y-px bg-indigo-600/10'
};

export const carouselNavStyles: StateStyles = {
  base: 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-ink-950 text-white transition-control duration-150 disabled:cursor-not-allowed disabled:opacity-40',
  interactive:
  'enabled:hover:bg-ink-900 enabled:active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  hover: 'bg-ink-900',
  focus: 'outline outline-2 outline-offset-2 outline-indigo-600',
  active: 'translate-y-px bg-ink-900'
};