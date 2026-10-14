import React from 'react';

type PageIntroProps = {
  title: string;
  lede: string;
  children?: React.ReactNode;
};

export function PageIntro({ title, lede, children }: PageIntroProps) {
  return (
    <section className="px-4 pb-16 pt-32 md:pb-24 lg:px-6">
      <div className="mx-auto flex max-w-content flex-col items-start gap-6">
        <h1 className="max-w-prose text-display-m text-on-dark md:text-display">{title}</h1>
        <p className="max-w-prose text-body-lg-m text-muted-on-dark md:text-body-lg">{lede}</p>
        {children}
      </div>
    </section>);

}