import React from 'react';

export function VisitorMessage({ text }: {text: string;}) {
  return (
    <div className="ml-auto max-w-prose self-end break-words rounded-card bg-ink-950 px-4 py-3 text-body text-on-dark">
      <span className="sr-only">You: </span>
      {text}
    </div>);

}