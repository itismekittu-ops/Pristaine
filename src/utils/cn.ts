import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
      {
        text: [
        'display',
        'display-m',
        'h2',
        'h2-m',
        'h3',
        'h3-m',
        'h4',
        'body-lg',
        'body-lg-m',
        'body',
        'small',
        'button']

      }],

      'font-family': [{ font: ['heading', 'sans'] }],
      rounded: [{ rounded: ['field', 'button', 'card', 'pill'] }],
      shadow: [{ shadow: ['glow', 'glow-strong'] }]
    }
  }
});

export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(...classes);
}