import { services } from './services';
import type { HeroClip } from '../types/hero';

const HERO_VIDEOS: Record<string, { webm: string; mp4: string }> = {
  'conversational-ai': {
    webm: '/videos/hero-1-conversational-ai.webm',
    mp4: '/videos/hero-1-conversational-ai.mp4',
  },
  'voice-ai': {
    webm: '/videos/hero-2-voice-ai.webm',
    mp4: '/videos/hero-2-voice-ai.mp4',
  },
  'ai-solutions': {
    webm: '/videos/hero-3-ai-solutions.webm',
    mp4: '/videos/hero-3-ai-solutions.mp4',
  },
  'ai-consultation': {
    webm: '/videos/hero-4-ai-consultation.webm',
    mp4: '/videos/hero-4-ai-consultation.mp4',
  },
};

const HERO_POSTERS: Record<string, string> = {
  'conversational-ai': '/hero-1-poster.webp',
  'voice-ai': '/hero-2-poster.webp',
  'ai-solutions': '/hero-3-poster.webp',
  'ai-consultation': '/hero-4-poster.webp',
};

export const heroClips: HeroClip[] = services.map((service) => ({
  slug: service.slug,
  caption: service.name,
  poster: HERO_POSTERS[service.slug] ?? '/hero-1-poster.webp',
  videoSrc: HERO_VIDEOS[service.slug],
}));
