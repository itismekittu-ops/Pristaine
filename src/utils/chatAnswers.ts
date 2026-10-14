import { approvedAnswers } from '../data/chatContent';

export function findApprovedAnswer(question: string): string | null {
  const q = question.toLowerCase();
  const match = approvedAnswers.find((answer) => answer.keywords.some((k) => q.includes(k)));
  return match ? match.text : null;
}

const SENSITIVE_PATTERNS = [
/(?:\d[ -]?){13,19}/, // card-like numbers
/\b\d{3}-\d{2}-\d{4}\b/, // SSN format
/\b(password|passcode|pin code|social security|social insurance)\b/i];


export function looksSensitive(text: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));
}