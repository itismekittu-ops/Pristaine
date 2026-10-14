import type { ReactNode } from 'react';
import type { InteractionState } from '../utils/navStyles';

export type StateRow = {
  label: string;
  note?: string;
  render: (state: InteractionState) => ReactNode;
};