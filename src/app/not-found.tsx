import Link from 'next/link';
import { PageIntro } from '../components/PageIntro';

export default function NotFound() {
  return (
    <>
      <PageIntro title="Page not found" lede="We couldn’t find that page. It may have moved, or the address may be incorrect." />
      <div className="px-4 pb-24 lg:px-6">
        <div className="mx-auto max-w-content">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-button bg-aqua-400 px-4 font-semibold text-ink-950">Back to home</Link>
        </div>
      </div>
    </>
  );
}
