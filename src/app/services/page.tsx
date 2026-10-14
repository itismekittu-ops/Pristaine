import { metadataForPath } from '../../config/seo';
import { Services } from '../../ui-pages/Services';

export const metadata = metadataForPath('/services');

export default function Page() {
  return <Services />;
}
