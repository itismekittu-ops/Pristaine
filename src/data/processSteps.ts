export type ProcessStep = {
  number: string;
  title: string;
  timeline: string;
  /** Placeholder copy, 30 words or fewer */
  description: string;
};

/** PLACEHOLDER COPY — replace the descriptions before launch. */
export const processSteps: ProcessStep[] = [
{
  number: '01',
  title: 'Discover',
  timeline: 'Week 1',
  description:
  'We learn how your team works today, map where time is lost and agree on the first problem worth solving together.'
},
{
  number: '02',
  title: 'Build',
  timeline: 'Weeks 2 to 6',
  description:
  'We design and build the tool in short cycles, sharing working versions each week so you can test it and steer it.'
},
{
  number: '03',
  title: 'Measure and improve',
  timeline: 'Ongoing',
  description:
  'Once it is live, we review how the tool is used, refine what needs attention and plan the next improvement with you.'
}];