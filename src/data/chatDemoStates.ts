import type { ChatStatus } from '../types/hero';

const LONG_QUESTION =
'We run two clinics and want an assistant that answers questions about opening hours, insurance and booking, then hands off to our front desk. ';

export const chatDemoStates: Array<{label: string;initialValue: string;initialStatus: ChatStatus;}> = [
{ label: 'Empty submit', initialValue: '', initialStatus: 'empty' },
{ label: 'Character limit reached (1,500)', initialValue: LONG_QUESTION.repeat(12).slice(0, 1500), initialStatus: 'idle' }];