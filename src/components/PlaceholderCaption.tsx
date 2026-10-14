import React from 'react';

type PlaceholderCaptionProps = {
  children: React.ReactNode;
};

/** Small production note shown between sections, never inside cards, answers or fields */
export function PlaceholderCaption({ children }: PlaceholderCaptionProps) {
  return <p className="bg-ink-950 px-4 py-3 text-center text-small text-muted-on-dark">{children}</p>;
}