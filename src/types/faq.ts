export type FaqInfo = {
  /** Accessible name for the info button */
  label: string;
  /** Popover copy, 40 words or fewer */
  text: string;
};

export type FaqEntry = {
  id: string;
  question: string;
  /** 60 words or fewer, no numbers, timeframes, prices or unverifiable claims */
  answer: string;
  info?: FaqInfo;
};