'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';

type ScaledFrameProps = {
  width: number;
  height: number;
  label: string;
  children: React.ReactNode;
};

/** Renders children at a fixed viewport width, scaled down to fit its column. */
export function ScaledFrame({ width, height, label, children }: ScaledFrameProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <div
        ref={outerRef}
        className="w-full overflow-hidden rounded-card border border-hairline-dark"
        style={{ height: height * scale }}>
        
        <div
          className="relative origin-top-left overflow-hidden bg-ink-950"
          style={{ width, height, transform: `scale(${scale})` }}>
          
          {children}
        </div>
      </div>
      <figcaption className="text-small text-muted-on-dark">{label}</figcaption>
    </figure>);

}