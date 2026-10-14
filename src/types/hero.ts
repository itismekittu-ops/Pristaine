export type HeroClip = {
  slug: string;
  caption: string;
  poster: string;
  /** Looping clip; omitted until produced. The poster is shown instead. */
  videoSrc?: string;
};

export type BrandPlaceholder = {
  id: string;
  alt: string;
};

export type ChatStatus = 'idle' | 'empty';