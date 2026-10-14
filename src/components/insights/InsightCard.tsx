'use client';

import React, { useId } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import { withState } from '../../utils/navStyles';
import { insightCardStyles, insightFocusRingStyles, insightPressStyles } from '../../utils/insightStyles';
import type { MotionValue } from 'framer-motion';
import type { ViewportLayout } from '../../utils/layout';
import type { InteractionState } from '../../utils/navStyles';
import type { Insight } from '../../types/insight';

export type InsightCardMotion = {
  /** Extra horizontal travel for text and tags (parallax) */
  shift: MotionValue<number>;
};

type InsightCardProps = {
  insight: Insight;
  /** Pinned: full-bleed slider panel. Carousel: rounded swipe card with a visible Read link */
  variant: 'pinned' | 'carousel';
  layout?: ViewportLayout;
  motionValues?: InsightCardMotion;
  /** Hide the native cursor over the image while the Read cursor is active */
  hideNativeCursor?: boolean;
  /** Static snapshot of a state (spec only); renders a non-interactive card */
  state?: InteractionState;
  onFocus?: () => void;
};

const MAX_TAGS = 4;

export function InsightCard({
  insight,
  variant,
  layout = 'responsive',
  motionValues,
  hideNativeCursor = false,
  state,
  onFocus
}: InsightCardProps) {
  const titleId = useId();
  const { slug, title, summary, tags, image } = insight;
  const pick = (responsive: string, desktop: string, mobile: string) =>
  variant === 'pinned' ? desktop : pickLayout(layout, responsive, desktop, mobile);
  const visibleTags = tags.slice(0, MAX_TAGS);
  const extraTags = tags.length - visibleTags.length;
  const nativeCursor = hideNativeCursor && 'cursor-pointer';
  const edgeX = pick('inset-x-4 md:inset-x-8', 'inset-x-8', 'inset-x-4');
  const edgeTop = pick('top-4 md:top-8', 'top-8', 'top-4');
  const edgeBottom = pick('bottom-4 md:bottom-8', 'bottom-8', 'bottom-4');

  const content =
  <>
      <img
      src={image}
      alt=""
      draggable={false}
      className="absolute inset-0 -z-10 h-full w-full select-none object-cover" />
    
      <span aria-hidden="true" className="insight-scrim absolute inset-x-0 bottom-0 -z-10" />
      <span aria-hidden="true" className={withState(insightPressStyles, state)} />

      <motion.span
      style={{ x: motionValues?.shift }}
      className={cn('pointer-events-none absolute flex flex-wrap justify-end gap-2', edgeX, edgeTop)}>
      
        {visibleTags.map((tag) =>
      <TagPill key={tag} label={tag} className={nativeCursor} />
      )}
        {extraTags > 0 && <TagPill label={`+${extraTags}`} className={nativeCursor} />}
      </motion.span>

      <motion.div
      style={{ x: motionValues?.shift }}
      className={cn('pointer-events-none absolute flex', edgeX, edgeBottom)}>
      
        <div className="flex w-full max-w-chat flex-col gap-2">
          <div className="flex items-start justify-between gap-6">
            <h3
            id={titleId}
            className={cn(
              'line-clamp-2 text-white [text-wrap:balance]',
              pick('text-h3-m md:text-h3', 'text-h3', 'text-h3-m')
            )}>
            
              {title}
            </h3>
            {variant === 'pinned' &&
          <span
            aria-hidden="true"
            data-cursor="native"
            className={cn(
              'pointer-events-auto -mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center text-white',
              nativeCursor
            )}>
            
                <ArrowUpRightIcon size={28} strokeWidth={1.5} />
              </span>
          }
          </div>
          <p className={cn('line-clamp-2 text-white', pick('text-small md:text-body', 'text-body', 'text-small'))}>
            {summary}
          </p>
          {variant === 'carousel' &&
        <span
          aria-hidden="true"
          className="mt-1 inline-flex h-11 items-center gap-1 self-start font-sans text-button font-semibold text-white underline underline-offset-4">
          
              Read
              <ArrowUpRightIcon size={18} strokeWidth={1.75} />
            </span>
        }
        </div>
      </motion.div>

      <span aria-hidden="true" className={withState(insightFocusRingStyles, state)} />
    </>;


  const rootClass = cn(
    withState(insightCardStyles, state),
    variant === 'carousel' && 'rounded-card',
    hideNativeCursor && 'cursor-none'
  );

  if (state) {
    return (
      <div data-cursor="read" className={rootClass}>
        {content}
      </div>);

  }

  return (
    <Link
      href={`/insights/${slug}`}
      aria-labelledby={titleId}
      data-cursor="read"
      draggable={false}
      onFocus={onFocus}
      className={rootClass}>
      
      {content}
    </Link>);

}

function TagPill({ label, className }: {label: string;className?: string | false;}) {
  return (
    <span
      data-cursor="native"
      className={cn(
        'pointer-events-auto inline-flex h-8 items-center whitespace-nowrap rounded-pill border border-white/70 bg-ink-950/80 px-3 font-sans text-small font-medium text-white',
        className
      )}>
      
      {label}
    </span>);

}