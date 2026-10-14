import { services } from './services';
import type { HeroClip } from '../types/hero';

const POSTER = "/hero-1-poster.webp";

// One clip per service; captions come from the shared services data.
// All share the stand-in poster until each service video is produced.
export const heroClips: HeroClip[] = services.map((service) => ({
  slug: service.slug,
  caption: service.name,
  poster: POSTER
}));