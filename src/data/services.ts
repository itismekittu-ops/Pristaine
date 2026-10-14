import { CompassIcon, MessageSquareTextIcon, PhoneCallIcon, WorkflowIcon } from 'lucide-react';
import type { Service } from '../types/navigation';

// Single source for service names and descriptions: navbar dropdown, mobile menu,
// hero caption, "What we build" cards and the Services page.
export const services: Service[] = [
{
  slug: 'conversational-ai',
  name: 'Conversational AI and Chatbots',
  description: 'Answer customers instantly on your site and messaging channels.',
  icon: MessageSquareTextIcon,
  tag: 'Chat',
  image: "/card-1-chat.webp"
},
{
  slug: 'voice-ai',
  name: 'Voice AI',
  description: 'AI phone agents that answer, qualify and book calls.',
  icon: PhoneCallIcon,
  tag: 'Voice',
  image: "/card-2-voice.webp"
},
{
  slug: 'ai-solutions',
  name: 'AI Solutions',
  description: 'Custom automations and integrations built around your workflow.',
  icon: WorkflowIcon,
  tag: 'Custom',
  image: "/card-3-solutions.webp"
},
{
  slug: 'ai-consultation',
  name: 'AI Consultation',
  description: 'Find where AI pays off first, with a clear roadmap.',
  icon: CompassIcon,
  tag: 'Advisory',
  image: "/card-4-consultation.webp"
}];