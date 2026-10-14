import React from 'react';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import type { ProcessStep } from '../../data/processSteps';
import type { ViewportLayout } from '../../utils/layout';

type ProcessStepContentProps = {
  step: ProcessStep;
  layout: ViewportLayout;
};

export function ProcessStepContent({ step, layout }: ProcessStepContentProps) {
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);

  return (
    <div className="flex flex-col items-start">
      <span
        aria-hidden="true"
        className={cn(
          'outline-numeral block font-heading font-normal',
          'text-display',
          // After the size classes so the class merger keeps it
          'leading-none'
        )}>
        
        {step.number}
      </span>
      <h3 className={cn('mt-4 text-on-dark', pick('text-h3-m lg:text-h3', 'text-h3', 'text-h3-m'))}>
        {step.title}
      </h3>
      <p
        className={cn(
          'mt-3 max-w-prose text-muted-on-dark',
          pick('text-body lg:text-body-lg', 'text-body-lg', 'text-body')
        )}>
        
        {step.description}
      </p>
      <p className="mt-3 text-small font-medium text-aqua-400">
        <span className="sr-only">Timeline: </span>
        {step.timeline}
      </p>
    </div>);

}