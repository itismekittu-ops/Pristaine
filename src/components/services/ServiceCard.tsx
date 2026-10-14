import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import { withState } from '../../utils/navStyles';
import {
  serviceCardArrowIconStyles,
  serviceCardArrowStyles,
  serviceCardImageStyles,
  serviceCardStyles } from
'../../utils/serviceCardStyles';
import type { ViewportLayout } from '../../utils/layout';
import type { InteractionState } from '../../utils/navStyles';
import type { Service } from '../../types/navigation';

type ServiceCardProps = {
  service: Service;
  layout?: ViewportLayout;
  /** Static snapshot of a state (spec only); renders a non-interactive card */
  sample?: InteractionState;
};

const pillClasses = 'rounded-field border border-hairline-dark bg-ink-900/85';

export function ServiceCard({ service, layout = 'responsive', sample }: ServiceCardProps) {
  const { name, description, icon: Icon, tag, image, slug } = service;
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);
  const inset = pick('inset-x-4 md:inset-x-8', 'inset-x-8', 'inset-x-4');
  const edgeTop = pick('top-4 md:top-8', 'top-8', 'top-4');
  const edgeBottom = pick('bottom-4 md:bottom-8', 'bottom-8', 'bottom-4');

  const content =
  <>
      <img src={image} alt="" className={withState(serviceCardImageStyles, sample)} />
      <span aria-hidden="true" className="card-scrim absolute inset-x-0 bottom-0 -z-10" />

      <span className={cn('absolute flex items-start justify-between', inset, edgeTop)}>
        <span className={cn(pillClasses, 'flex h-11 w-11 items-center justify-center text-on-dark')}>
          <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className={cn(pillClasses, 'px-3 py-1 text-small font-medium text-on-dark')}>{tag}</span>
      </span>

      <div className={cn('absolute flex items-end justify-between gap-6', inset, edgeBottom)}>
        <div className="flex min-w-0 flex-col gap-2">
          <h3 className={cn('text-on-dark', pick('text-h3-m md:text-h3', 'text-h3', 'text-h3-m'))}>{name}</h3>
          <p className="max-w-md text-body text-muted-on-dark">{description}</p>
        </div>
        <span aria-hidden="true" className={withState(serviceCardArrowStyles, sample)}>
          <ArrowRightIcon size={20} strokeWidth={1.5} className={withState(serviceCardArrowIconStyles, sample)} />
        </span>
      </div>
    </>;


  const shape = pick('aspect-card-mobile md:aspect-card', 'aspect-card', 'aspect-card-mobile');

  if (sample) {
    return <div className={cn(withState(serviceCardStyles, sample), shape)}>{content}</div>;
  }

  return (
    <Link href={`/services#${slug}`} aria-label={name} className={cn(withState(serviceCardStyles), shape)}>
      {content}
    </Link>);

}