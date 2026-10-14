import React from 'react';
import { SectionHeading } from './SectionHeading';

type SpecSectionProps = {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SpecSection({ id, title, description, children }: SpecSectionProps) {
  return (
    <section aria-labelledby={id} className="px-4 py-16 md:py-24 lg:px-6">
      <div className="mx-auto flex max-w-content flex-col gap-8">
        <SectionHeading id={id} title={title} description={description} />
        {children}
      </div>
    </section>);

}