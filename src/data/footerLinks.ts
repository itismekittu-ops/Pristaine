import { services } from './services';

export type FooterLink = {label: string;to: string;};
export type FooterGroup = {title: string;links: FooterLink[];};

export const footerTagline = 'AI for small and mid-sized businesses in the US and Canada.';

export const footerGroups: FooterGroup[] = [
{
  title: 'Services',
  links: services.map(({ name, slug }) => ({ label: name, to: `/services#${slug}` }))
},
{
  title: 'Company',
  links: [
  { label: 'About', to: '/about' },
  { label: 'Insights', to: '/insights' }]

},
{
  title: 'Legal',
  links: [{ label: 'Privacy Policy', to: '/privacy' }]
}];