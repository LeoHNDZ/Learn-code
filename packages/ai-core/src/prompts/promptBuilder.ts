import { ChatMessage } from '../types';
import { SYSTEM_PRIMER } from './systemPrompts';

const MAX_CONTEXT_MESSAGES = 20; // simple cap; could be token-based later

export function buildPrompt(messages: ChatMessage[], context?: string): string {
  const trimmed = messages.slice(-MAX_CONTEXT_MESSAGES);
  const header = SYSTEM_PRIMER + (context ? `\nContext:\n${context}\n` : '\n');
  return header + trimmed.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
}