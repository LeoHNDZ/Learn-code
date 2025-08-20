import { GenerationResult } from '../types';

interface RawGeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>;
  [k: string]: any;
}

export function normalizeGeminiResponse(raw: RawGeminiResponse): GenerationResult {
  const first = raw?.candidates?.[0];
  const text = first?.content?.parts?.map(p => p.text || '').join('') || '';
  return {
    text,
    finishReason: (first?.finishReason as any) || 'stop',
    raw
  };
}