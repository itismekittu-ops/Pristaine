import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { generalAnswer } from '../data/chatContent';
import { findApprovedAnswer, looksSensitive } from '../utils/chatAnswers';
import type { ChatEntry, ChatNoticeKind, EmailOfferStatus, SendResult } from '../types/chat';

const SLOW_DOWN_MS = 2000;
const STREAM_START_MS = 700;
const STREAM_WORD_MS = 45;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let counter = 0;
const nextId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

type Options = {
  initialEntries?: ChatEntry[];
  initialOpen?: boolean;
  initialEmailStatus?: EmailOfferStatus;
};

export function useChatPanel({ initialEntries = [], initialOpen = false, initialEmailStatus = 'idle' }: Options = {}) {
  const [open, setOpen] = useState(initialOpen);
  const [entries, setEntries] = useState<ChatEntry[]>(initialEntries);
  const [emailStatus, setEmailStatus] = useState<EmailOfferStatus>(initialEmailStatus);
  const [emailValue, setEmailValueState] = useState('');
  const [emailFocusToken, setEmailFocusToken] = useState(0);
  const streamingRef = useRef(initialEntries.some((e) => e.kind === 'assistant' && e.streaming));
  const lastSentRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
    },
    []
  );

  const append = (entry: ChatEntry) => setEntries((prev) => [...prev, entry]);
  const appendNotice = (notice: ChatNoticeKind) => append({ id: nextId(), kind: 'notice', notice });
  const offerEmail = () =>
  setEntries((prev) => prev.some((e) => e.kind === 'email-offer') ? prev : [...prev, { id: nextId(), kind: 'email-offer' }]);

  const streamAnswer = (text: string) => {
    const id = nextId();
    const words = text.split(' ');
    streamingRef.current = true;
    append({ id, kind: 'assistant', text: '', streaming: true });

    const start = window.setTimeout(() => {
      let count = 0;
      const interval = window.setInterval(() => {
        count += 1;
        const done = count >= words.length;
        const partial = words.slice(0, count).join(' ');
        setEntries((prev) =>
        prev.map((e) => e.id === id && e.kind === 'assistant' ? { ...e, text: partial, streaming: !done } : e)
        );
        if (done) {
          window.clearInterval(interval);
          streamingRef.current = false;
          offerEmail();
        }
      }, STREAM_WORD_MS);
      timersRef.current.push(interval);
    }, STREAM_START_MS);
    timersRef.current.push(start);
  };

  const send = (text: string): SendResult => {
    setOpen(true);
    const now = Date.now();
    if (streamingRef.current || now - lastSentRef.current < SLOW_DOWN_MS) {
      appendNotice('slow-down');
      return 'kept';
    }
    if (looksSensitive(text)) {
      appendNotice('blocked');
      return 'kept';
    }
    lastSentRef.current = now;
    append({ id: nextId(), kind: 'visitor', text });
    const approved = findApprovedAnswer(text);
    if (approved) {
      append({ id: nextId(), kind: 'assistant', text: approved, approved: true });
      offerEmail();
    } else {
      streamAnswer(generalAnswer);
    }
    return 'accepted';
  };

  const requestSendMessage = () => {
    if (emailStatus === 'sent') return;
    setOpen(true);
    if (emailStatus === 'declined') setEmailStatus('idle');
    offerEmail();
    setEmailFocusToken((t) => t + 1);
  };

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    if (EMAIL_PATTERN.test(emailValue.trim())) {
      setEmailStatus('sent');
    } else {
      setEmailStatus('invalid');
      setEmailFocusToken((t) => t + 1);
    }
  };

  const setEmailValue = (value: string) => {
    setEmailValueState(value);
    if (emailStatus === 'invalid') setEmailStatus('idle');
  };

  const close = useCallback(() => setOpen(false), []);
  const hasEmailOffer = entries.some((e) => e.kind === 'email-offer');

  return {
    open,
    entries,
    emailStatus,
    emailValue,
    emailFocusToken,
    emailOfferActive: hasEmailOffer && (emailStatus === 'idle' || emailStatus === 'invalid'),
    send,
    close,
    requestSendMessage,
    submitEmail,
    setEmailValue,
    declineEmail: () => setEmailStatus('declined')
  };
}