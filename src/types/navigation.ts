import type { LucideIcon } from 'lucide-react';

export type Service = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Short category tag shown on the service card */
  tag: string;
  /** Abstract background image for the service card */
  image: string;
};

/** responsive = media queries; the others force a layout for fixed-width previews */
export type NavbarLayout = 'responsive' | 'desktop' | 'mobile' | 'mobile-narrow';

/** Where Book a Consultation sits inside the mobile sheet */
export type CtaPlacement = 'responsive' | 'first' | 'last';