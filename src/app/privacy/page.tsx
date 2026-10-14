import { metadataForPath } from '../../config/seo';
import { Privacy } from '../../ui-pages/Privacy';

export const metadata = metadataForPath('/privacy');

export default function Page() {
  return <Privacy />;
}
