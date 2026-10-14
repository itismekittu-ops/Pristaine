'use client';

import React, { useEffect } from 'react';

import { useReducedMotion } from 'framer-motion';
import { PageIntro } from '../components/PageIntro';
import { cookieCategories } from '../data/cookieCategories';

export function Privacy() {
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
        title="Privacy policy"
        lede="Our full privacy policy, including how AI assistant chats are stored, will be published here before launch." />
      
      <section id="cookies" aria-labelledby="cookies-heading" className="scroll-mt-24 px-4 pb-16 md:pb-24 lg:px-6">
        <div className="mx-auto max-w-content">
          <h2 id="cookies-heading" className="text-h2-m text-on-dark md:text-h2">
            Cookies
          </h2>
          <p className="mt-4 max-w-prose text-body text-muted-on-dark">
            Necessary cookies are always on. Analytics and third-party services stay off until you turn them on. You
            can change your choices at any time with Cookie settings at the bottom of every page.
          </p>
          <dl className="mt-8 flex max-w-prose flex-col divide-y divide-hairline-dark border-y border-hairline-dark">
            {cookieCategories.map((category) =>
            <div key={category.id} className="py-4">
                <dt className="text-body font-medium text-on-dark">{category.name}</dt>
                <dd className="mt-1 text-body text-muted-on-dark">{category.description}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </>);

}