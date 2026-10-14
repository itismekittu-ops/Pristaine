'use client';

import React, { useEffect } from 'react';

import { useReducedMotion } from 'framer-motion';
import { PageIntro } from '../components/PageIntro';
import { services } from '../data/services';

export function Services() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }, [reduceMotion]);

  return (
    <>
      <PageIntro
        title="Services"
        lede="Four ways we help growing businesses get real value from AI, from the first conversation to running in production." />
      
      <section aria-label="Service list" className="px-4 pb-16 md:pb-24 lg:px-6">
        <ul className="mx-auto flex max-w-content flex-col divide-y divide-hairline-dark border-y border-hairline-dark">
          {services.map(({ slug, name, description, icon: Icon }) =>
          <li key={slug} id={slug} className="flex scroll-mt-24 items-start gap-4 py-8">
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" className="mt-1 shrink-0 text-aqua-400" />
              <div className="flex flex-col gap-2">
                <h2 className="text-h3-m text-on-dark md:text-h3">{name}</h2>
                <p className="max-w-prose text-body text-muted-on-dark">{description}</p>
              </div>
            </li>
          )}
        </ul>
      </section>
    </>);

}