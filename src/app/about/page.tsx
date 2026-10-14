import { metadataForPath } from '../../config/seo';
import { About } from '../../ui-pages/About';

export const metadata = metadataForPath('/about');

export default function Page() {
  return <About />;
}
