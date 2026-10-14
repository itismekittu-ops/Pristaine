import { useState } from 'react';
import type React from 'react';
import type { ChatStatus } from '../types/hero';
import type { SendResult } from '../types/chat';

export const CHAT_CHAR_LIMIT = 1500;

export type ChatMessage = {tone: 'hint' | 'limit';text: string;};

type Options = {
  initialValue?: string;
  initialStatus?: ChatStatus;
  /** Returns 'kept' when the text should stay in the bar (slow-down, blocked) */
  onSend?: (text: string) => SendResult;
};

export function useHeroChat({ initialValue = '', initialStatus = 'idle', onSend }: Options) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<ChatStatus>(initialStatus);
  const [focused, setFocused] = useState(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value.slice(0, CHAT_CHAR_LIMIT));
    if (status === 'empty') setStatus('idle');
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (!text) {
      setStatus('empty');
      return;
    }
    const result = onSend ? onSend(text) : 'accepted';
    if (result === 'accepted') setValue('');
  };

  const atLimit = value.length >= CHAT_CHAR_LIMIT;

  let message: ChatMessage | null = null;
  if (status === 'empty') message = { tone: 'hint', text: 'Type a question to start.' };else
  if (atLimit) message = { tone: 'limit', text: 'You’ve reached the 1,500 character limit.' };

  return {
    value,
    status,
    focused,
    message,
    onChange,
    onSubmit,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false)
  };
}