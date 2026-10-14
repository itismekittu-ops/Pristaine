'use client';

import React from 'react';
import { ClockIcon, CloudOffIcon, ShieldAlertIcon } from 'lucide-react';
import { noticeCopy } from '../../../data/chatContent';
import { cn } from '../../../utils/cn';
import { viewAllLinkStyles, withState } from '../../../utils/navStyles';
import type { ChatNoticeKind } from '../../../types/chat';

const ICONS = { unavailable: CloudOffIcon, 'slow-down': ClockIcon, blocked: ShieldAlertIcon };

type ProblemCardProps = {
  kind: ChatNoticeKind;
  onEditQuestion: () => void;
};

export function ProblemCard({ kind, onEditQuestion }: ProblemCardProps) {
  const copy = noticeCopy[kind];
  const Icon = ICONS[kind];

  return (
    <div className="flex gap-3 rounded-card border border-hairline-dark bg-ink-950 p-4">
      <Icon
        size={24}
        strokeWidth={1.5}
        aria-hidden="true"
        className={cn('shrink-0', kind === 'slow-down' ? 'text-aqua-400' : 'text-error-dark')} />
      
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-body font-semibold text-on-dark">{copy.title}</p>
        {copy.body && <p className="text-small text-muted-on-dark">{copy.body}</p>}
        {kind === 'blocked' &&
        <button type="button" onClick={onEditQuestion} className={cn(withState(viewAllLinkStyles), '-ml-3 self-start')}>
            Edit my question
          </button>
        }
      </div>
    </div>);

}