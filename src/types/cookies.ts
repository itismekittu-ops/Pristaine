export type CookieCategoryId = 'necessary' | 'analytics' | 'thirdParty';

/** Optional categories only; Necessary is always on */
export type CookieChoices = {
  analytics: boolean;
  thirdParty: boolean;
};

export type CookieCategory = {
  id: CookieCategoryId;
  name: string;
  description: string;
  /** Necessary cookies cannot be switched off */
  locked: boolean;
};

/** hidden: no UI; banner: first-visit card; manage: category panel */
export type CookieView = 'hidden' | 'banner' | 'manage';