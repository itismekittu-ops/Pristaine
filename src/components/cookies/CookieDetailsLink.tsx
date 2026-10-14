import React from 'react';
import Link from 'next/link';
import { cookieDetailsHref } from '../../data/cookieCategories';
import { cookieTextLinkStyles } from '../../utils/cookieStyles';
import { withState } from '../../utils/navStyles';
import type { InteractionState } from '../../utils/navStyles';

/** Goes to the Cookies section of the Privacy Policy page */
export function CookieDetailsLink({ sample }: {sample?: InteractionState;}) {
  if (sample) return <span className={withState(cookieTextLinkStyles, sample)}>Cookie details</span>;
  return (
    <Link href={cookieDetailsHref} className={withState(cookieTextLinkStyles)}>
      Cookie details
    </Link>);

}