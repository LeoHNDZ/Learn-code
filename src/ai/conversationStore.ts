import { create } from 'zustand';
import { ChatMessage } from '../../packages/ai-core/src/types';
import { nanoid } from '../util/nanoid';

interface ConversationState {
  messages: ChatMessage[];
  status: 'idle' | 'thinking' | 'streaming' | 'error';
  error?: string;
  currentPartial?: string;
  addUserMessage: (content: string) => ChatMessage;
  addAssistantMessage: (content: string) => ChatMessage;
  appendPartial: (delta: string) => void;
  commitPartial: () => void;
  setStatus: (s: ConversationState['status']) => void;
  setError: (e?: string) => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  messages: [],
  status: 'idle',
  addUserMessage: (content) => {
    const msg: ChatMessage = { id: nanoid(), role: 'user', content, createdAt: Date.now() };
    set(s => ({ messages: [...s.messages, msg] }));
    return msg;
  },
  addAssistantMessage: (content) => {
    const msg: ChatMessage = { id: nanoid(), role: 'assistant', content, createdAt: Date.now() };
    set(s => ({ messages: [...s.messages, msg] }));
    return msg;
  },
  appendPartial: (delta) => {
    set(s => ({ currentPartial: (s.currentPartial || '') + delta }));
  },
  commitPartial: () => {
    const partial = get().currentPartial;
    if (!partial) return;
    const msg: ChatMessage = { id: nanoid(), role: 'assistant', content: partial, createdAt: Date.now() };
    set(s => ({ messages: [...s.messages, msg], currentPartial: undefined }));
  },
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error })
}));