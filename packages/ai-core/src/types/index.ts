export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

export interface GenerationRequest {
  model: string;
  messages: ChatMessage[];
  context?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

export interface GenerationChunk {
  delta: string;
  done: boolean;
}

export interface GenerationResult {
  text: string;
  tokens?: number;
  finishReason?: 'stop' | 'length' | 'safety' | 'error';
  raw: unknown;
}

export interface GeminiAdapter {
  generate(req: GenerationRequest): Promise<GenerationResult>;
  stream?(req: GenerationRequest, onChunk: (chunk: GenerationChunk) => void): Promise<GenerationResult>;
}

export interface AIModelConfig {
  defaultModel: string;
  maxOutputTokens: number;
}