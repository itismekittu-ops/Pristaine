'use client';

import React, { useCallback, useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { ArrowUpIcon, CircleAlertIcon, InfoIcon } from 'lucide-react';
import { ChatPlaceholder } from './ChatPlaceholder';
import { ChatPanel } from './chat/ChatPanel';
import { CHAT_CHAR_LIMIT, useHeroChat } from '../../hooks/useHeroChat';
import { useChatPanel } from '../../hooks/useChatPanel';
import { cn } from '../../utils/cn';
import { chatBarStyles, privacyLinkStyles, submitButtonStyles } from '../../utils/heroStyles';
import { pickLayout } from '../../utils/layout';
import { withState } from '../../utils/navStyles';
import type { ViewportLayout } from '../../utils/layout';
import type { ChatStatus } from '../../types/hero';
import type { ChatPanelDemo } from '../../types/chat';

type ChatBarProps = {
  layout?: ViewportLayout;
  reducedMotion?: boolean;
  initialValue?: string;
  initialStatus?: ChatStatus;
  /** Opens the panel pre-filled with a state (spec previews) */
  panelDemo?: ChatPanelDemo;
  panelMaxHeight?: number;
};

export function ChatBar({
  layout = 'responsive',
  reducedMotion,
  initialValue,
  initialStatus,
  panelDemo,
  panelMaxHeight
}: ChatBarProps) {
  const panel = useChatPanel(
    panelDemo ?
    { initialEntries: panelDemo.entries, initialOpen: true, initialEmailStatus: panelDemo.emailStatus } :
    undefined
  );
  const chat = useHeroChat({ initialValue: panelDemo?.barValue ?? initialValue, initialStatus, onSend: panel.send });
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? !!systemReduced;
  const inputId = useId();
  const statusId = useId();
  const noticeId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);
  const showPlaceholder = !chat.focused && chat.value.length === 0;
  const scoped = !!panelDemo;

  const focusInput = useCallback(() => inputRef.current?.focus(), []);
  const { open: panelOpen, close: closePanelState } = panel;
  const closePanel = useCallback(() => {
    closePanelState();
    focusInput();
  }, [closePanelState, focusInput]);

  useEffect(() => {
    if (!panelOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (scoped && !wrapperRef.current?.contains(document.activeElement)) return;
      closePanel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [panelOpen, closePanel, scoped]);

  return (
    <div className="mx-auto flex w-full max-w-chat flex-col items-center gap-3">
      <div ref={wrapperRef} className="relative w-full">
        <form
          noValidate
          aria-label="Ask our AI assistant"
          onSubmit={chat.onSubmit}
          className={cn(
            withState(chatBarStyles),
            chat.focused && chatBarStyles.focus,
            pick('h-14 pl-3 pr-2 md:h-16 md:pl-6', 'h-16 pl-6 pr-2', 'h-14 pl-3 pr-2')
          )}>
          
          <div className="relative h-full min-w-0 flex-1">
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={chat.value}
              onChange={chat.onChange}
              onFocus={chat.onFocus}
              onBlur={chat.onBlur}
              maxLength={CHAT_CHAR_LIMIT}
              autoComplete="off"
              enterKeyHint="send"
              aria-label="Ask our AI assistant a question about our services"
              aria-describedby={`${statusId} ${noticeId}`}
              className="h-full w-full truncate bg-transparent px-1 text-left text-body-lg-m text-on-dark focus:outline-none" />
            
            {showPlaceholder && <ChatPlaceholder layout={layout} reduced={reduced} />}
          </div>
          <button type="submit" aria-label="Send question" className={withState(submitButtonStyles)}>
            <ArrowUpIcon size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </form>

        <ChatPanel
          open={panel.open}
          entries={panel.entries}
          layout={layout}
          reduced={reduced}
          maxHeightPx={panelMaxHeight}
          scrollIntoViewOnOpen={!scoped}
          emailStatus={panel.emailStatus}
          emailValue={panel.emailValue}
          emailFocusToken={panel.emailFocusToken}
          emailOfferActive={panel.emailOfferActive}
          onEmailChange={panel.setEmailValue}
          onEmailSubmit={panel.submitEmail}
          onEmailDecline={panel.declineEmail}
          onRequestSendMessage={panel.requestSendMessage}
          onEditQuestion={focusInput}
          onClose={closePanel} />
        
      </div>

      <div id={statusId} role="status" aria-live="polite" className="w-full px-4">
        {chat.message &&
        <p className="flex items-center justify-center gap-2 text-center text-small text-on-dark">
            {chat.message.tone === 'hint' &&
          <InfoIcon size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-aqua-400" />
          }
            {chat.message.tone === 'limit' &&
          <CircleAlertIcon size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-error-dark" />
          }
            {chat.message.text}
          </p>
        }
      </div>

      <p id={noticeId} className="mx-auto max-w-prose px-4 text-center text-small text-muted-on-dark">
        This is an AI assistant. Your chat is saved. Please don’t enter sensitive details.{' '}
        <Link href="/privacy" className={withState(privacyLinkStyles)}>
          Privacy Policy
        </Link>
      </p>
    </div>);

}