import type { CookieCategory, CookieChoices } from '../types/cookies';

export const cookieCategories: CookieCategory[] = [
{
  id: 'necessary',
  name: 'Necessary',
  description: 'Keep the site working, for example by remembering the choices you make here. These are always on.',
  locked: true
},
{
  id: 'analytics',
  name: 'Analytics',
  description: 'Help us see which pages are visited so we can improve the site. Off unless you turn them on.',
  locked: false
},
{
  id: 'thirdParty',
  name: 'Third-party services',
  description: 'Let us load booking from Calendly, which may set its own cookies. Off unless you turn them on.',
  locked: false
}];


export const defaultCookieChoices: CookieChoices = { analytics: false, thirdParty: false };

export const cookieBannerLine =
'We use cookies to run this site and, with your permission, to measure it and load booking.';

/** Cookies section of the Privacy Policy page */
export const cookieDetailsHref = '/privacy#cookies';

/** Placeholder scheduling page until the real Calendly link is confirmed */
export const calendlyUrl = 'https://calendly.com/pristaine';
export const calendlyPrivacyUrl = 'https://calendly.com/privacy';