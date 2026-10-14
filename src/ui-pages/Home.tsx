import React from 'react';
import { Hero } from '../components/hero/Hero';
import { WhatWeBuild } from '../components/services/WhatWeBuild';
import { HowItWorks } from '../components/process/HowItWorks';
import { ClosingCta } from '../components/cta/ClosingCta';
import { Insights } from '../components/insights/Insights';
import { Faq } from '../components/faq/Faq';
import { Contact } from '../components/contact/Contact';

export function Home() {
  return (
    <>
      <Hero />
      <WhatWeBuild />
      <HowItWorks />
      <ClosingCta />
      <Insights />
      <Faq />
      <Contact />
    </>);

}