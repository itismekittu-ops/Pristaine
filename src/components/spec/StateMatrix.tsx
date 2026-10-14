import React from 'react';
import type { InteractionState } from '../../utils/navStyles';
import type { StateRow } from '../../types/spec';

const STATES: InteractionState[] = ['default', 'hover', 'focus', 'active'];

type StateMatrixProps = {
  rows: StateRow[];
  label: string;
};

export function StateMatrix({ rows, label }: StateMatrixProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-card border border-hairline-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400">
      
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline-dark">
            <th scope="col" className="px-4 py-3 text-small font-medium text-muted-on-dark">
              Control
            </th>
            {STATES.map((state) =>
            <th key={state} scope="col" className="px-4 py-3 text-small font-medium capitalize text-muted-on-dark">
                {state}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline-dark">
          {rows.map((row) =>
          <tr key={row.label}>
              <th scope="row" className="px-4 py-4 align-middle font-normal">
                <span className="block whitespace-nowrap text-body font-medium text-on-dark">{row.label}</span>
                {row.note && <span className="block text-small text-muted-on-dark">{row.note}</span>}
              </th>
              {STATES.map((state) =>
            <td key={state} className="px-4 py-4 align-middle">
                  <div className="inline-flex rounded-card bg-ink-900 p-3">{row.render(state)}</div>
                </td>
            )}
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}