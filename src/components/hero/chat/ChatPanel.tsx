'use client';

import React, { useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { AssistantMessage } from './AssistantMessage';
import { VisitorMessage } from './VisitorMessage';
import { ProblemCard } from './ProblemCard';
import { EmailOfferCard } from './EmailOfferCard';
import { cn } from '../../../utils/cn';
import { pickLayout } from '../../../utils/layout';
import { DURATION, EASE } from '../../../utils/motion';
import { chevronButtonStyles, withState } from '../../../utils/navStyles';
import { panelPrimaryButtonStyles, privacyLinkStyles, secondaryButtonStyles } from '../../../utils/heroStyles';
import type { ViewportLayout } from '../../../utils/layout';
import type { ChatEntry, EmailOfferStatus } from '../../../types/chat';

type ChatPanelProps = {
  open: boolean;
  entries: ChatEntry[];
  layout: ViewportLayout;
  reduced: boolean;
  /** Fixed max height for previews; live uses 60% of the screen */
  maxHeightPx?: number;
  scrollIntoViewOnOpen: boolean;
  emailStatus: EmailOfferStatus;
  emailValue: string;
  emailFocusToken: number;
  emailOfferActive: boolean;
  onEmailChange: (value: string) => void;
  onEmailSubmit: (event: React.FormEvent) => void;
  onEmailDecline: () => void;
  onRequestSendMessage: () => void;
  onEditQuestion: () => void;
  onClose: () => void;
};

export function ChatPanel(props: ChatPanelProps) {
  const { open, entries, layout, reduced, maxHeightPx, scrollIntoViewOnOpen } = props;
  const titleId = useId();
  const formId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);
  const padX = pick('px-4 md:px-6', 'px-6', 'px-4');

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [entries, open]);

  useEffect(() => {
    if (open && scrollIntoViewOnOpen) {
      panelRef.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    }
  }, [open, scrollIntoViewOnOpen, reduced]);

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
        transition={{ duration: reduced ? 0 : DURATION.dropdown, ease: EASE }}
        style={maxHeightPx ? { maxHeight: maxHeightPx } : undefined}
        className={cn(
          'absolute top-full z-30 mt-2 flex flex-col overflow-hidden border border-border-dark bg-ink-900 text-left',
          !maxHeightPx && 'max-h-panel',
          pick(
            '-inset-x-4 rounded-t-card border-x-0 md:inset-x-0 md:rounded-card md:border-x',
            'inset-x-0 rounded-card',
            '-inset-x-4 rounded-t-card border-x-0'
          )
        )}>
        
          <div
          className={cn(
            'flex h-14 shrink-0 items-center justify-between border-b border-hairline-dark pr-2',
            pick('pl-4 md:pl-6', 'pl-6', 'pl-4')
          )}>
          
            <h2 id={titleId} className="font-heading text-body font-semibold text-on-dark">
              Pristaine AI assistant
            </h2>
            <button type="button" aria-label="Close chat" onClick={props.onClose} className={withState(chevronButtonStyles)}>
              <XIcon size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <div
          ref={threadRef}
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          tabIndex={0}
          className={cn(
            'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-aqua-400',
            padX
          )}>
          
            {entries.map((entry) => {
            if (entry.kind === 'visitor') return <VisitorMessage key={entry.id} text={entry.text} />;
            if (entry.kind === 'assistant') {
              return (
                <AssistantMessage
                  key={entry.id}
                  text={entry.text}
                  approved={entry.approved}
                  streaming={entry.streaming}
                  reduced={reduced} />);


            }
            if (entry.kind === 'notice') {
              return <ProblemCard key={entry.id} kind={entry.notice} onEditQuestion={props.onEditQuestion} />;
            }
            return (
              <EmailOfferCard
                key={entry.id}
                formId={formId}
                status={props.emailStatus}
                value={props.emailValue}
                focusToken={props.emailFocusToken}
                onChange={props.onEmailChange}
                onSubmit={props.onEmailSubmit}
                onDecline={props.onEmailDecline} />);


          })}
          </div>

          <div className={cn('flex shrink-0 flex-col gap-3 border-t border-hairline-dark py-4', padX)}>
            <p className="text-small text-muted-on-dark">
              This is an AI assistant. Conversations are saved in redacted form and may be processed by an AI provider. Please don’t enter sensitive details.{' '}
              <Link href="/privacy" className={withState(privacyLinkStyles)}>
                Privacy Policy
              </Link>
            </p>
            <div className={cn('flex gap-2', pick('md:justify-end md:gap-3', 'justify-end gap-3', ''))}>
              <Link
              href="/book"
              className={cn(
                withState(panelPrimaryButtonStyles),
                pick('h-11 flex-1 px-3 text-small md:h-12 md:flex-none md:px-4 md:text-button', '', 'h-11 flex-1 px-3 text-small')
              )}>
              
                Book a Consultation
              </Link>
              <button
              type={props.emailOfferActive ? 'submit' : 'button'}
              form={props.emailOfferActive ? formId : undefined}
              onClick={props.emailOfferActive ? undefined : props.onRequestSendMessage}
              aria-disabled={props.emailStatus === 'sent' || undefined}
              className={cn(
                withState(secondaryButtonStyles),
                pick('h-11 px-3 text-small md:h-12 md:px-4 md:text-button', '', 'h-11 px-3 text-small')
              )}>
              
                Send message
              </button>
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}