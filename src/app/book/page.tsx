import { metadataForPath } from '../../config/seo';
import { BookConsultation } from '../../ui-pages/BookConsultation';

export const metadata = metadataForPath('/book');

export default function Page() {
  return <BookConsultation />;
}
