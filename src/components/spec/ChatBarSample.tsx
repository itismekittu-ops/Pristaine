import React from 'react';
import { ArrowUpIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { chatBarStyles, submitButtonStyles } from '../../utils/heroStyles';
import { withState } from '../../utils/navStyles';
import type { InteractionState } from '../../utils/navStyles';

/** Static snapshot of the chat bar for the states table. Active = typing. */
export function ChatBarSample({ state }: {state: InteractionState;}) {
  const typing = state === 'active';
  return (
    <span className={cn(withState(chatBarStyles, state), 'h-16 pl-6 pr-2')}>
      <span
        className={cn(
          'whitespace-nowrap px-1 text-body-lg-m',
          typing ? 'text-on-dark' : 'text-muted-on-dark'
        )}>
        
        {typing ? 'How fast can a chatbot go live?' : 'Ask a question about chatbots'}
      </span>
      <span className={withState(submitButtonStyles, 'default')}>
        <ArrowUpIcon size={20} strokeWidth={1.5} aria-hidden="true" />
      </span>
    </span>);

}