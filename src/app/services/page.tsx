import { metadataForPath } from '../../config/seo';
import { ServicesPage } from '../../ui-pages/ServicesPage';

export const metadata = metadataForPath('/services');

export default function Page() {
  return <ServicesPage />;
}
