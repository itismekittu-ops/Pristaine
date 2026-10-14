import React from 'react';

/** Neutral stand-in for page content beneath the navbar in previews. */
export function PageSkeleton() {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 top-32 flex flex-col gap-4 px-8">
      <div className="h-12 w-3/4 rounded-field bg-on-dark/5" />
      <div className="h-12 w-1/2 rounded-field bg-on-dark/5" />
      <div className="mt-4 h-4 w-2/3 rounded-field bg-on-dark/5" />
      <div className="h-4 w-1/2 rounded-field bg-on-dark/5" />
    </div>);

}