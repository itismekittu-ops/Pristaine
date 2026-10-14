'use client';

import React from 'react';
import { useTransform } from 'framer-motion';
import { InsightCard } from './InsightCard';
import type { MotionValue } from 'framer-motion';
import type { MutableRefObject } from 'react';
import type { InteractionState } from '../../utils/navStyles';
import type { Insight } from '../../types/insight';

export type SliderMetrics = {cardWidth: number;maxTravel: number;};

type PinnedInsightSlotProps = {
  insight: Insight;
  index: number;
  trackX: MotionValue<number>;
  metricsRef: MutableRefObject<SliderMetrics>;
  hideNativeCursor: boolean;
  state?: InteractionState;
  onFocus?: () => void;
};

/** Text and tags travel 12% faster than the image */
const PARALLAX = 0.12;

export function PinnedInsightSlot({
  insight,
  index,
  trackX,
  metricsRef,
  hideNativeCursor,
  state,
  onFocus
}: PinnedInsightSlotProps) {
  // 0 when centred, negative while leaving to the left, positive while entering from the right
  const offset = useTransform(trackX, (v) => {
    const width = Math.max(metricsRef.current.cardWidth, 1);
    return (v + index * width) / width;
  });
  // Text stays full-strength white at every position so it always meets contrast over the image
  const shift = useTransform(offset, (v) => v * metricsRef.current.cardWidth * PARALLAX);

  return (
    <InsightCard
      insight={insight}
      variant="pinned"
      motionValues={{ shift }}
      hideNativeCursor={hideNativeCursor}
      state={state}
      onFocus={onFocus} />);


}