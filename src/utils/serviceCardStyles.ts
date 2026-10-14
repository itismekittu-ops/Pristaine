import type { StateStyles } from './navStyles';

export const serviceCardStyles: StateStyles = {
  base: 'group relative isolate block w-full overflow-hidden rounded-card bg-ink-900 text-left transition-control duration-150',
  interactive:
  'active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400',
  hover: '',
  focus: 'outline outline-2 outline-offset-2 outline-aqua-400',
  active: 'translate-y-px'
};

export const serviceCardImageStyles: StateStyles = {
  base: 'absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-400',
  interactive: 'group-hover:scale-105',
  hover: 'scale-105',
  focus: '',
  active: 'scale-105'
};

export const serviceCardArrowStyles: StateStyles = {
  base: 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-aqua-400 text-ink-950 transition-control duration-150',
  interactive: 'group-hover:bg-aqua-400/90 group-active:bg-aqua-400/80',
  hover: 'bg-aqua-400/90',
  focus: '',
  active: 'bg-aqua-400/80'
};

export const serviceCardArrowIconStyles: StateStyles = {
  base: 'transition-transform duration-150',
  interactive: 'group-hover:translate-x-1',
  hover: 'translate-x-1',
  focus: '',
  active: 'translate-x-1'
};