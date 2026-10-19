'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';

import { cn } from '../utils/cn';
import { withState, primaryButtonStyles } from '../utils/navStyles';
import { useSaveData } from '../hooks/useSaveData';
import { ClosingCta } from '../components/cta/ClosingCta';
import { services } from '../data/services';
import type { Service } from '../types/navigation';

const HERO_VIDEO = '/videos/pristaine-services-hero-background.mp4';
const HERO_POSTER_WEBP = '/Pristaine_Services_Hero_Poster.webp';
const HERO_POSTER_JPG = '/Pristaine_Services_Hero_Poster.jpg';

type ChooseServiceProps = {
  service: Service;
  points: string[];
};

function ChooseService({ service, points }: ChooseServiceProps) {
  const { name, description, icon: Icon, slug } = service;
  return (
    <li
      id={`choose-${slug}`}
      className="flex scroll-mt-24 flex-col gap-4 rounded-card border border-hairline-dark bg-ink-900/60 p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-field border border-hairline-dark bg-ink-900/85 text-aqua-400">
          <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h3 className="text-h4 text-on-dark">{name}</h3>
      </div>
      <p className="text-body text-muted-on-dark">{description}</p>
      <ul className="flex flex-col gap-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-small text-muted-on-dark">
            <CheckIcon size={16} strokeWidth={2} aria-hidden="true" className="mt-1 shrink-0 text-aqua-400" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function ServicesPage() {
  const headingId = useId();
  const chooseHeadingId = useId();
  const processHeadingId = useId();
  const systemReduced = useReducedMotion();
  const saveData = useSaveData();
  const reduced = !!systemReduced;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const showVideo = !reduced && !saveData && !videoFailed;

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => setVideoFailed(true));
    }
  }, [showVideo]);

  return (
    <>
      {/* Cinematic hero */}
      <section
        aria-labelledby={headingId}
        className="relative isolate flex min-h-[640px] w-full flex-col justify-end bg-ink-950"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-ink-950">
          {showVideo ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              poster={HERO_POSTER_WEBP}
              className="hero-poster absolute inset-0 h-full w-full object-cover"
              onError={() => setVideoFailed(true)}
            >
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
          ) : (
            <picture>
              <source srcSet={HERO_POSTER_WEBP} type="image/webp" />
              <img
                src={HERO_POSTER_JPG}
                alt=""
                className={cn('hero-poster absolute inset-0 h-full w-full object-cover', !reduced && 'hero-drift')}
              />
            </picture>
          )}
          <div className="hero-scrim absolute inset-0" />
          <div className="hero-bottom-fade absolute inset-x-0 bottom-0" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-content flex-col items-center gap-8 px-4 pb-16 pt-32 text-center sm:pt-40 lg:px-6">
          <h1
            id={headingId}
            className="mx-auto max-w-headline text-center font-heading font-semibold text-on-dark [text-wrap:balance] text-display-m md:text-display"
          >
            Find the right AI solution for your business.
          </h1>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/book" className={cn(withState(primaryButtonStyles), 'px-6')}>
              Book a Consultation
            </Link>
            <Link
              href="#services-overview"
              className={cn(
                'inline-flex h-12 items-center justify-center whitespace-nowrap rounded-button border border-hairline-dark bg-ink-900/85 px-6 font-sans text-button font-semibold text-on-dark transition-control duration-150',
                'hover:bg-on-dark/5 active:bg-on-dark/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400'
              )}
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Service cards */}
      <section id="services-overview" aria-label="Our services" className="scroll-mt-24 px-4 py-16 md:py-24 lg:px-6">
        <div className="mx-auto flex max-w-content flex-col gap-8">
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((service) => {
              const { slug, name, description, icon: Icon, tag, image } = service;
              return (
                <li key={slug} id={slug} className="scroll-mt-24">
                  <div className="relative flex aspect-card-mobile flex-col justify-end overflow-hidden rounded-card border border-hairline-dark md:aspect-card">
                    <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
                    <span aria-hidden="true" className="card-scrim absolute inset-x-0 bottom-0 -z-10" />
                    <div className="flex flex-col gap-4 p-6 md:p-8">
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-field border border-hairline-dark bg-ink-900/85 text-on-dark">
                          <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                        </span>
                        <span className="rounded-field border border-hairline-dark bg-ink-900/85 px-3 py-1 text-small font-medium text-on-dark">
                          {tag}
                        </span>
                      </div>
                      <h2 className="text-h3-m text-on-dark md:text-h3">{name}</h2>
                      <p className="text-body text-muted-on-dark">{description}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Service selection section */}
      <section
        aria-labelledby={chooseHeadingId}
        className="border-y border-hairline-dark bg-ink-900/40 px-4 py-16 md:py-24 lg:px-6"
      >
        <div className="mx-auto flex max-w-content flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2
              id={chooseHeadingId}
              className="text-h2-m text-on-dark md:text-h2"
            >
              Which service fits your business?
            </h2>
            <p className="max-w-prose text-body-lg-m text-muted-on-dark md:text-body-lg">
              Start from the challenge you are facing today. Each service solves a different kind of problem.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChooseService
              service={services[0]}
              points={[
                'Customers ask the same questions all day on your website or messaging channels',
                'You want replies that stay on-brand and on-topic without a bigger support team',
                'You need an assistant that hands off cleanly to a person when needed',
              ]}
            />
            <ChooseService
              service={services[1]}
              points={[
                'Your phones ring more than your team can answer',
                'Callers hang up before they reach the right person',
                'You want calls answered, qualified and booked around the clock',
              ]}
            />
            <ChooseService
              service={services[2]}
              points={[
                'Your team repeats the same steps across tools and spreadsheets',
                'Your data lives in systems that do not talk to each other',
                'You need a workflow automated end-to-end, not just another dashboard',
              ]}
            />
            <ChooseService
              service={services[3]}
              points={[
                'You know AI matters but are not sure where it pays off first',
                'You want a realistic plan before committing budget',
                'You need an honest second opinion on a proposal or vendor',
              ]}
            />
          </ul>
        </div>
      </section>

      {/* Three-step process */}
      <section
        aria-labelledby={processHeadingId}
        className="px-4 py-16 md:py-24 lg:px-6"
      >
        <div className="mx-auto flex max-w-content flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2 id={processHeadingId} className="text-h2-m text-on-dark md:text-h2">
              How we work
            </h2>
            <p className="max-w-prose text-body-lg-m text-muted-on-dark md:text-body-lg">
              Three steps from first conversation to a tested, working launch.
            </p>
          </div>
          <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Understand',
                description: 'We learn how your business works today and agree on the first problem worth solving.',
              },
              {
                number: '02',
                title: 'Design',
                description: 'We design the solution in short cycles, sharing working versions you can steer.',
              },
              {
                number: '03',
                title: 'Test and Launch',
                description: 'We test with real scenarios, launch when it is ready and refine from actual use.',
              },
            ].map((step) => (
              <li key={step.number} className="flex flex-col gap-4 rounded-card border border-hairline-dark bg-ink-900/60 p-6">
                <span aria-hidden="true" className="outline-numeral text-h2-m md:text-h2">
                  {step.number}
                </span>
                <h3 className="text-h4 text-on-dark">{step.title}</h3>
                <p className="text-body text-muted-on-dark">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
