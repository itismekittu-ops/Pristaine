import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { generalAnswer } from '../data/chatContent';
import { findApprovedAnswer, looksSensitive } from '../utils/chatAnswers';
import type { ChatEntry, ChatNoticeKind, EmailOfferStatus, SendResult } from '../types/chat';

const SLOW_DOWN_MS = 2000;
const STREAM_START_MS = 700;
const STREAM_WORD_MS = 45;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Must match FOLLOWUP_CONSENT_VERSION in the contact-submit Edge Function.
const FOLLOWUP_CONSENT_VERSION = 'v1';

let counter = 0;
const nextId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function getOrCreateVisitorId(): string {
  const KEY = 'pristaine_chat_visitor_id';
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

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
  const visitorIdRef = useRef<string | null>(null);

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

  const setAssistantAnswer = (text: string, approved: boolean) => {
    const id = nextId();
    if (approved) {
      append({ id, kind: 'assistant', text, approved: true });
      offerEmail();
    } else {
      streamingRef.current = true;
      append({ id, kind: 'assistant', text: '', streaming: true });
      const words = text.split(' ');
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
    }
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

    // Try the chat-assistant Edge Function first
    if (SUPABASE_URL && SUPABASE_ANON_KEY && !visitorIdRef.current) {
      visitorIdRef.current = getOrCreateVisitorId();
    }

    const visitorId = visitorIdRef.current ?? '';
    const chatHistory = entries
      .filter((e): e is ChatEntry & { kind: 'visitor' } | ChatEntry & { kind: 'assistant' } =>
        e.kind === 'visitor' || (e.kind === 'assistant' && !e.streaming))
      .slice(-10)
      .map((e) => ({
        role: e.kind === 'visitor' ? 'visitor' : 'assistant',
        content: e.text,
      }));

    const endpoint = `${SUPABASE_URL}/functions/v1/chat-assistant`;

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        message: text,
        visitor_id: visitorId,
        page: typeof window !== 'undefined' ? window.location.pathname : '/',
        history: chatHistory,
      }),
    })
      .then((resp) => resp.json())
      .then((data: { answer?: string; answer_source?: string }) => {
        if (data.answer) {
          setAssistantAnswer(data.answer, data.answer_source === 'approved');
        } else {
          setAssistantAnswer(generalAnswer, false);
        }
      })
      .catch(() => {
        // Network error or endpoint unavailable — fall back to local logic
        const approved = findApprovedAnswer(text);
        if (approved) {
          setAssistantAnswer(approved, true);
        } else {
          setAssistantAnswer(generalAnswer, false);
        }
      });

    return 'accepted';
  };

  const requestSendMessage = () => {
    if (emailStatus === 'sent' || emailStatus === 'submitting') return;
    setOpen(true);
    if (emailStatus === 'declined') setEmailStatus('idle');
    offerEmail();
    setEmailFocusToken((t) => t + 1);
  };

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    if (emailStatus === 'submitting') return;
    const email = emailValue.trim();
    if (!EMAIL_PATTERN.test(email)) {
      setEmailStatus('invalid');
      setEmailFocusToken((t) => t + 1);
      return;
    }

    if (SUPABASE_URL && SUPABASE_ANON_KEY && !visitorIdRef.current) {
      visitorIdRef.current = getOrCreateVisitorId();
    }
    const visitorId = visitorIdRef.current;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !visitorId) {
      setEmailStatus('error');
      return;
    }

    setEmailStatus('submitting');

    fetch(`${SUPABASE_URL}/functions/v1/contact-submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        mode: 'chat_followup',
        email,
        consent_given: true,
        consent_line_version: FOLLOWUP_CONSENT_VERSION,
        visitor_id: visitorId,
        source_page: typeof window !== 'undefined' ? window.location.pathname : '/',
      }),
    })
      .then(async (resp) => {
        if (resp.ok) {
          setEmailStatus('sent');
        } else {
          // Validation or server failure: keep the entered email and allow retry.
          setEmailStatus('error');
        }
      })
      .catch(() => {
        setEmailStatus('error');
      });
  };

  const setEmailValue = (value: string) => {
    setEmailValueState(value);
    if (emailStatus === 'invalid' || emailStatus === 'error') setEmailStatus('idle');
  };

  const close = useCallback(() => setOpen(false), []);
  const hasEmailOffer = entries.some((e) => e.kind === 'email-offer');

  return {
    open,
    entries,
    emailStatus,
    emailValue,
    emailFocusToken,
    emailOfferActive: hasEmailOffer && (emailStatus === 'idle' || emailStatus === 'invalid' || emailStatus === 'error'),
    send,
    close,
    requestSendMessage,
    submitEmail,
    setEmailValue,
    declineEmail: () => setEmailStatus('declined')
  };
}
