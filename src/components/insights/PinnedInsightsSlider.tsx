'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { InsightsEndPanel } from './InsightsEndPanel';
import { PinnedInsightSlot } from './PinnedInsightSlot';
import { ReadCursor } from './ReadCursor';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReadCursor } from '../../hooks/useReadCursor';
import { useScrollTrack } from '../../hooks/useScrollTrack';
import type { SliderMetrics } from './PinnedInsightSlot';
import type { Insight, InsightsSample } from '../../types/insight';

type PinnedInsightsSliderProps = {
  insights: Insight[];
  sample?: InsightsSample;
};

const MIN_STAGE_HEIGHT = 560;
/** Track is about 600vh tall */
const TRACK_SCREENS = 6;
const CARD_RATIO = 0.93;
const END_RATIO = 0.5;
/** Light smoothing, overdamped so it never bounces */
const PROGRESS_SPRING = { stiffness: 260, damping: 42, mass: 0.6 };

export function PinnedInsightsSlider({ insights, sample }: PinnedInsightsSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { progress, viewport, scrollToProgress } = useScrollTrack(trackRef, {
    enabled: !sample,
    minStageHeight: MIN_STAGE_HEIGHT
  });
  const smooth = useSpring(progress, PROGRESS_SPRING);

  const width = viewport.width;
  const stageHeight = sample ? sample.height : Math.max(viewport.height, MIN_STAGE_HEIGHT);
  const trackHeight = sample ? stageHeight : viewport.height * TRACK_SCREENS;
  const cardWidth = width * CARD_RATIO;
  const lead = (width - cardWidth) / 2;
  const endWidth = width * END_RATIO;
  const maxTravel = Math.max(lead + insights.length * cardWidth + endWidth - width, 0);
  const metricsRef = useRef<SliderMetrics>({ cardWidth, maxTravel });
  metricsRef.current = { cardWidth, maxTravel };

  const liveX = useTransform(smooth, (v) => -v * metricsRef.current.maxTravel);
  const sampleX = useMotionValue(0);
  const sampleTarget = !sample ? 0 : sample.at === 'end' ? -maxTravel : -sample.at * cardWidth;
  useLayoutEffect(() => {
    sampleX.set(sampleTarget);
  }, [sampleX, sampleTarget]);
  const trackX = sample ? sampleX : liveX;

  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const cursorLive = finePointer && !sample;
  const cursor = useReadCursor(stageRef, cursorLive, trackX);

  const focusPosition = (position: number) => {
    if (sample) return;
    scrollToProgress(maxTravel > 0 ? position / maxTravel : 0);
  };

  return (
    <div ref={trackRef} className="relative" style={{ height: trackHeight }}>
      <div
        ref={stageRef}
        role="region"
        aria-label="Insights articles"
        className="sticky top-0 overflow-clip bg-surface-50"
        style={{ height: stageHeight }}
        {...cursor.handlers}>
        
        <motion.ul role="list" className="flex h-full w-max pb-8 pt-24" style={{ x: trackX, paddingLeft: lead }}>
          {insights.map((insight, index) =>
          <li key={insight.slug} className="h-full shrink-0" style={{ width: cardWidth }}>
              <PinnedInsightSlot
              insight={insight}
              index={index}
              trackX={trackX}
              metricsRef={metricsRef}
              hideNativeCursor={finePointer}
              state={sample ? index === 0 && sample.cardState || 'default' : undefined}
              onFocus={() => focusPosition(index * cardWidth)} />
            
            </li>
          )}
          <li className="h-full shrink-0" style={{ width: endWidth }}>
            <InsightsEndPanel
              buttonState={sample ? 'default' : undefined}
              onFocus={() => focusPosition(maxTravel)} />
            
          </li>
        </motion.ul>

        {cursorLive && <ReadCursor x={cursor.x} y={cursor.y} mode={cursor.mode} pressed={cursor.pressed} />}
        {sample?.cursor &&
        <ReadCursor
          x={sample.cursor.x}
          y={sample.cursor.y}
          mode={sample.cursor.mode}
          pressed={sample.cursor.pressed}
          instant />

        }
      </div>
    </div>);

}