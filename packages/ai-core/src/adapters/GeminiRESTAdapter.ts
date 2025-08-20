import { GeminiAdapter, GenerationRequest, GenerationResult, GenerationChunk } from '../types';
import { normalizeGeminiResponse } from '../parsing/normalizeGeminiResponse';
import { AIError, classifyError } from '../errors/AIError';
import { buildPrompt } from '../prompts/promptBuilder';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiRESTAdapter implements GeminiAdapter {
  async generate(req: GenerationRequest): Promise<GenerationResult> {
    try {
      const prompt = buildPrompt(req.messages, req.context);
      const res = await fetch(`${API_URL}/${req.model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: req.maxTokens, temperature: req.temperature } })
      });
      if (!res.ok) throw new AIError(`Gemini error status ${res.status}`, res.status === 401 ? 'AUTH' : res.status === 429 ? 'RATE_LIMIT' : 'UNKNOWN', res.status);
      const json = await res.json();
      return normalizeGeminiResponse(json);
    } catch (e) {
      throw classifyError(e);
    }
  }

  async stream(req: GenerationRequest, onChunk: (c: GenerationChunk) => void): Promise<GenerationResult> {
    // Placeholder: real streaming would use the streaming endpoint when available.
    const result = await this.generate(req);
    onChunk({ delta: result.text, done: true });
    return result;
  }
}