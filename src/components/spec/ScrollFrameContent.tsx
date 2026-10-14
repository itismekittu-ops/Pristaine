import React from 'react';

/** Scrollable viewport inside a preview frame, so sticky and in-view behaviour can be tried. */
export function ScrollFrameContent({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="absolute inset-0 overflow-y-auto bg-ink-950 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-aqua-400">
      
      {children}
    </div>);

}