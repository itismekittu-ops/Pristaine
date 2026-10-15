export type VideoSources = {
  webm: string;
  mp4: string;
};

export type HeroClip = {
  slug: string;
  caption: string;
  poster: string;
  /** Looping clip sources; when absent the poster is shown. */
  videoSrc?: VideoSources;
};

export type BrandPlaceholder = {
  id: string;
  alt: string;
};

export type ChatStatus = 'idle' | 'empty';