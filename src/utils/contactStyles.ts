const focusRing =
'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400';

/** Text fields: 16px text, border-dark border, 2px aqua ring with 2px offset on focus */
export const contactFieldBase =
'block w-full rounded-field bg-ink-900 px-4 text-body text-on-dark transition-control duration-150 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-aqua-400';
export const contactFieldBorder = 'border border-border-dark hover:border-muted-on-dark';
/** Error: thicker error-coloured border, always paired with an icon and text */
export const contactFieldErrorBorder = 'border-2 border-error-dark';
export const contactFieldFocusStatic = 'outline outline-2 outline-offset-2 outline-aqua-400';

/** Left-column links with a small leading icon, 44px target */
export const contactLinkStyles = `group inline-flex h-11 items-center gap-3 rounded-button text-body font-medium text-on-dark transition-control duration-150 ${focusRing}`;
export const contactLinkTextStyles =
'underline decoration-border-dark underline-offset-4 transition-control duration-150 group-hover:decoration-on-dark';

/** Inline text link inside a sentence */
export const inlineLinkStyles = `rounded-[2px] font-medium text-on-dark underline underline-offset-4 hover:decoration-2 ${focusRing}`;

/** Outline button used for retry */
export const secondaryButtonStyles = `inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-button border border-border-dark px-4 text-small font-semibold text-on-dark transition-control duration-150 hover:bg-on-dark/5 active:bg-on-dark/10 ${focusRing}`;