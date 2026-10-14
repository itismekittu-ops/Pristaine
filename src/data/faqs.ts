import type { FaqEntry } from '../types/faq';

export const faqs: FaqEntry[] = [
{
  id: 'services',
  question: 'What do your services do?',
  answer:
  'We design and build AI assistants that answer common questions, guide visitors to the right information and pass enquiries to your team. Each one is shaped around your services, your tone of voice and the way your customers already get in touch.'
},
{
  id: 'timeline',
  question: 'How long does a project take?',
  answer:
  'It depends on scope. Once we understand what you need, the timeline is agreed with you after the first consultation, together with what will be delivered at each stage.'
},
{
  id: 'privacy',
  question: 'How do you handle data and privacy?',
  answer:
  'Before anything is built, we agree with you what information the assistant may use, where it is kept and who can access it. You decide what is stored and when it is removed.',
  info: {
    label: 'More about how data is handled',
    text: 'How data is handled is agreed with you before work begins, including what is stored, where it is kept and who can access it. Our privacy policy sets out the current details.'
  }
},
{
  id: 'testing',
  question: 'How is the AI tested before launch?',
  answer:
  'We test the assistant against real questions from your business, review its answers with your team and refine anything that is unclear. It goes live only when you are happy with how it responds.'
},
{
  id: 'tools',
  question: 'Which tools can it connect to?',
  answer:
  'It can work alongside tools you already use, such as your website, booking system, inbox or help desk. Which connections make sense for you is confirmed during the first consultation.'
},
{
  id: 'getting-started',
  question: 'What do we need to get started?',
  answer:
  'A conversation about your goals, access to the information you want the assistant to use, and someone on your team who can review its answers. We guide you through the rest.'
},
{
  id: 'handoff',
  question: 'Who answers when the AI cannot?',
  answer:
  'When the assistant cannot help, it hands the conversation to a person on your team, along with the details gathered so far, so your customer does not have to repeat themselves.'
}];