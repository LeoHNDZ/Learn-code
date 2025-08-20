import { useCallback, useRef } from 'react';
import { useConversationStore } from './conversationStore';
import { GeminiClient, GeminiRESTAdapter } from '../../packages/ai-core/src';

const client = new GeminiClient(new GeminiRESTAdapter());

export function useAI() {
  const abortRef = useRef<AbortController | null>(null);
  const { messages, status, error, addUserMessage, appendPartial, commitPartial, setStatus, setError } = useConversationStore();

  const send = useCallback(async (content: string) => {
    addUserMessage(content);
    setStatus('thinking');
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await client.stream({ messages, onDelta: (d) => { appendPartial(d); setStatus('streaming'); }, signal: controller.signal });
      commitPartial();
      setStatus('idle');
    } catch (e: any) {
      setError(e.message || 'Error');
      setStatus('error');
    }
  }, [messages, addUserMessage, appendPartial, commitPartial, setStatus, setError]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
  }, [setStatus]);

  return { messages, status, error, send, cancel };
}