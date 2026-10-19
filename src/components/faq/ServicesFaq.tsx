'use client';

import React, { useId, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

import { FaqItem } from './FaqItem';
import type { FaqEntry } from '../../types/faq';

const serviceFaqs: FaqEntry[] = [
  {
    id: 'chat-vs-voice',
    question: 'What is the difference between Conversational AI and Voice AI?',
    answer:
    'Conversational AI handles written conversations on your website and messaging channels. Voice AI answers phone calls, so callers can get answers, be qualified and book appointments without waiting for an available team member.'
  },
  {
    id: 'workflows',
    question: 'What business workflows can AI Solutions automate?',
    answer:
    'Repeating manual steps are the usual starting point: moving information between systems that do not talk to each other, routing enquiries to the right person, or handling follow-ups the same way every time. Which workflow to automate first is agreed with you during the first consultation.'
  },
  {
    id: 'choosing',
    question: 'How do I choose the right AI service for my business?',
    answer:
    'Start from the problem that costs you the most time today. If customers ask the same questions online, start with Conversational AI. If your phones overflow, start with Voice AI. If your team repeats steps across tools, look at AI Solutions. If you are not sure, a consultation is the right first step.'
  },
  {
    id: 'integrations',
    question: 'Can your AI solutions integrate with tools we already use?',
    answer:
    'Yes. Solutions are designed to work alongside the systems your team already uses, such as your website, inbox, booking system or help desk. Which connections make sense for your setup is confirmed during the first consultation before any work begins.'
  },
  {
    id: 'testing',
    question: 'How do you test AI solutions before launch?',
    answer:
    'We test against realistic scenarios from your business, review the results with your team and refine anything that is unclear or off-brand. Nothing goes live until you are satisfied with how it handles real situations.'
  },
  {
    id: 'handoff',
    question: 'Can a human take over when an AI assistant cannot help?',
    answer:
    'Yes. When the assistant cannot help, it hands the conversation to a person on your team together with the details gathered so far, so your customer does not have to start over or repeat themselves.'
  },
  {
    id: 'privacy',
    question: 'How do you approach data privacy and customer information?',
    answer:
    'Before anything is built, we agree with you what information the solution may use, where it is kept and who can access it. You decide what is stored and when it is removed. Our privacy policy sets out the current details.'
  }
];

export function ServicesFaq() {
  const headingId = useId();
  const systemReduced = useReducedMotion();
  const reduced = !!systemReduced;
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggle = (id: string) =>
    setOpenIds((ids) => (ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]));

  return (
    <section
      aria-labelledby={headingId}
      className="bg-white px-4 py-16 text-on-light md:py-24 lg:px-6"
    >
      <div className="mx-auto max-w-chat">
        <h2
          id={headingId}
          className="mb-8 text-center text-h2-m text-on-light md:mb-12 md:text-h2"
        >
          Frequently asked questions
        </h2>
        <ul className="divide-y divide-hairline-light">
          {serviceFaqs.map((faq) => (
            <li key={faq.id}>
              <FaqItem
                faq={faq}
                open={openIds.includes(faq.id)}
                onToggle={toggle}
                reduced={reduced}
                questionClass="text-body-lg-m md:text-h4"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
