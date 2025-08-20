import { GeminiAdapter, GenerationRequest, GenerationResult } from '../types';

export class GeminiClient {
  constructor(private adapter: GeminiAdapter, private defaultModel = 'gemini-1.5-flash') {}

  async generate(req: Omit<GenerationRequest, 'model'> & { model?: string }): Promise<GenerationResult> {
    return this.adapter.generate({ model: req.model || this.defaultModel, ...req });
  }

  async stream(req: Omit<GenerationRequest, 'model'> & { model?: string; onDelta: (delta: string) => void }): Promise<GenerationResult> {
    const { onDelta, ...rest } = req;
    return this.adapter.stream?.({ model: rest.model || this.defaultModel, ...rest }, chunk => onDelta(chunk.delta)) || this.generate(rest as any);
  }
}