import type { InteractionState } from '../utils/navStyles';

export type Insight = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  image: string;
};

/** What the custom "Read" cursor shows: full disc, a small dot, or nothing */
export type CursorMode = 'read' | 'dot' | 'hidden';

/** Previews only: freeze the pinned slider at one position */
export type InsightsSample = {
  /** Track position in card widths (0 = first card centred, 1.5 = between cards 2 and 3), or the end */
  at: number | 'end';
  /** Fixed stage height in px */
  height: number;
  /** Static cursor, in stage coordinates */
  cursor?: {x: number;y: number;mode: CursorMode;pressed?: boolean;};
  /** Forced interaction state for the first card */
  cardState?: InteractionState;
};