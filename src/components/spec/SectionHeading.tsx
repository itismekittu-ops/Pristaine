import React from 'react';

type SectionHeadingProps = {
  id: string;
  title: string;
  description: string;
};

export function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 id={id} className="text-h3-m text-on-dark md:text-h3">
        {title}
      </h2>
      <p className="max-w-prose text-body text-muted-on-dark">{description}</p>
    </div>);

}