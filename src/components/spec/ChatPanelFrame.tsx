import React from 'react';
import { ChatBar } from '../hero/ChatBar';
import { cn } from '../../utils/cn';
import type { ChatPanelDemo } from '../../types/chat';

type ChatPanelFrameProps = {
  demo: ChatPanelDemo;
  layout: 'desktop' | 'mobile';
  frameHeight: number;
  reducedMotion?: boolean;
};

/** The chat bar with its panel open in a given state, sized to 60% of the frame height. */
export function ChatPanelFrame({ demo, layout, frameHeight, reducedMotion }: ChatPanelFrameProps) {
  return (
    <div className={cn('absolute inset-0 bg-ink-950 pt-12', layout === 'desktop' ? 'px-6' : 'px-4')}>
      <ChatBar
        layout={layout}
        reducedMotion={reducedMotion}
        panelDemo={demo}
        panelMaxHeight={Math.round(frameHeight * 0.6)} />
      
    </div>);

}