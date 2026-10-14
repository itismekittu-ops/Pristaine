import type { ChatNoticeKind } from '../types/chat';

// Pre-approved answers shown at once. They only restate published service descriptions.
export const approvedAnswers: Array<{id: string;keywords: string[];text: string;}> = [
{
  id: 'conversational-ai',
  keywords: ['chatbot', 'chat bot', 'conversational', 'messaging', 'website chat'],
  text: 'Conversational AI and Chatbots: we build assistants that answer customers instantly on your site and messaging channels. If you’d like to see how this could fit your business, book a consultation and we’ll talk it through.'
},
{
  id: 'voice-ai',
  keywords: ['voice', 'phone', 'calls'],
  text: 'Voice AI: we build AI phone agents that answer, qualify and book calls. To talk through how this could work for your business, book a consultation.'
},
{
  id: 'ai-solutions',
  keywords: ['automation', 'automate', 'workflow', 'custom'],
  text: 'AI Solutions: we build custom automations around your workflow. A consultation is the best way to look at your processes together.'
},
{
  id: 'ai-consultation',
  keywords: ['consultation', 'consult', 'roadmap', 'where to start'],
  text: 'AI Consultation: we help you find where AI pays off first, with a clear roadmap. You can book a consultation using the button below.'
}];


export const generalAnswer =
'Thanks for your question. I can share general information about our four services: Conversational AI and Chatbots, Voice AI, AI Solutions and AI Consultation. For anything specific to your business, the best next step is a consultation with our team.';

export const noticeCopy: Record<ChatNoticeKind, {title: string;body?: string;}> = {
  unavailable: {
    title: 'The assistant isn’t available right now',
    body: 'Your messages are still here. You can book a consultation or send our team a message using the buttons below.'
  },
  'slow-down': {
    title: 'Please wait a moment. Your text is kept.'
  },
  blocked: {
    title: 'We couldn’t send that message',
    body: 'It looks like it includes sensitive details, such as a card number or password. Remove those details and ask again in general terms, or use the buttons below.'
  }
};