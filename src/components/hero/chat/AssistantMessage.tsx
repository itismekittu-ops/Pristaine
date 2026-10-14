import React from 'react';
import { SparklesIcon } from 'lucide-react';
import { TypingIndicator } from './TypingIndicator';

type AssistantMessageProps = {
  text: string;
  approved?: boolean;
  streaming?: boolean;
  reduced: boolean;
};

export function AssistantMessage({ text, approved, streaming, reduced }: AssistantMessageProps) {
  return (
    <div className="flex max-w-prose flex-col gap-1 self-start" aria-busy={streaming || undefined}>
      <span className="flex items-center gap-2 text-small font-medium text-muted-on-dark">
        <SparklesIcon size={16} strokeWidth={1.5} aria-hidden="true" className="text-aqua-400" />
        AI assistant
        {approved && <span className="font-normal">· Approved answer</span>}
      </span>
      {text && <p className="break-words text-body text-on-dark">{text}</p>}
      {streaming && <TypingIndicator reduced={reduced} />}
    </div>);

}