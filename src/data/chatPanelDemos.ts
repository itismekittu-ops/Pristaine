import { approvedAnswers, generalAnswer } from './chatContent';
import type { ChatPanelDemo } from '../types/chat';

const chatbotAnswer = approvedAnswers[0].text;
const voiceAnswer = approvedAnswers[1].text;

export const chatPanelDemos: ChatPanelDemo[] = [
{
  id: 'approved',
  title: '1. Approved answer',
  description: 'A pre-approved answer appears at once, with no typing delay.',
  entries: [
  { id: 'a1', kind: 'visitor', text: 'Can you build a chatbot for our website?' },
  { id: 'a2', kind: 'assistant', text: chatbotAnswer, approved: true }]

},
{
  id: 'streaming',
  title: '2. Answer streaming',
  description: 'The answer appears word by word with a typing indicator. With reduced motion the indicator is a static “Writing...” label.',
  entries: [
  { id: 's1', kind: 'visitor', text: 'What would working with you look like?' },
  { id: 's2', kind: 'assistant', text: generalAnswer.split(' ').slice(0, 14).join(' '), streaming: true }],

  showReducedVariant: true
},
{
  id: 'unavailable',
  title: '3. Assistant unavailable',
  description: 'A plain-language card. Earlier messages stay visible, and the foot buttons offer a way forward.',
  entries: [
  { id: 'u1', kind: 'visitor', text: 'Do you build phone agents?' },
  { id: 'u2', kind: 'assistant', text: voiceAnswer, approved: true },
  { id: 'u3', kind: 'visitor', text: 'Could it work after hours?' },
  { id: 'u4', kind: 'notice', notice: 'unavailable' }]

},
{
  id: 'slow-down',
  title: '4. Slow down',
  description: 'Shown when messages are sent too quickly. The visitor’s text stays in the bar.',
  entries: [
  { id: 'w1', kind: 'visitor', text: 'Can you build a chatbot for our website?' },
  { id: 'w2', kind: 'assistant', text: chatbotAnswer, approved: true },
  { id: 'w3', kind: 'notice', notice: 'slow-down' }],

  barValue: 'And how do you handle privacy?'
},
{
  id: 'blocked',
  title: '5. Blocked message',
  description: 'A plain reason and a way to rephrase. The text stays in the bar for editing.',
  entries: [
  { id: 'b1', kind: 'visitor', text: 'Can you build a chatbot for our website?' },
  { id: 'b2', kind: 'assistant', text: chatbotAnswer, approved: true },
  { id: 'b3', kind: 'notice', notice: 'blocked' }],

  barValue: 'Can I pay with card 4111 1111 1111 1111?'
},
{
  id: 'email',
  title: '6. Optional email offer',
  description: 'Offered once after an answer. Consent is stated next to the field, and “No thanks” dismisses it.',
  entries: [
  { id: 'e1', kind: 'visitor', text: 'Can you build a chatbot for our website?' },
  { id: 'e2', kind: 'assistant', text: chatbotAnswer, approved: true },
  { id: 'e3', kind: 'email-offer' }],

  emailStatus: 'idle'
}];