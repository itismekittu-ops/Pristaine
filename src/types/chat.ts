export type ChatNoticeKind = 'unavailable' | 'slow-down' | 'blocked';

export type ChatEntry =
{id: string;kind: 'visitor';text: string;} |
{id: string;kind: 'assistant';text: string;approved?: boolean;streaming?: boolean;} |
{id: string;kind: 'notice';notice: ChatNoticeKind;} |
{id: string;kind: 'email-offer';};

export type EmailOfferStatus = 'idle' | 'invalid' | 'submitting' | 'error' | 'sent' | 'declined';

export type SendResult = 'accepted' | 'kept';

export type ChatPanelDemo = {
  id: string;
  title: string;
  description: string;
  entries: ChatEntry[];
  /** Text left in the chat bar (kept after slow-down or blocked) */
  barValue?: string;
  emailStatus?: EmailOfferStatus;
  /** Also show this state with reduced motion */
  showReducedVariant?: boolean;
};