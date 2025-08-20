export type AIErrorCode = 'AUTH' | 'RATE_LIMIT' | 'NETWORK' | 'SAFETY' | 'UNKNOWN';

export class AIError extends Error {
  code: AIErrorCode;
  status?: number;
  constructor(message: string, code: AIErrorCode = 'UNKNOWN', status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function classifyError(e: any): AIError {
  if (e instanceof AIError) return e;
  const msg = typeof e?.message === 'string' ? e.message : 'Unknown error';
  if (/401|403/.test(msg)) return new AIError(msg, 'AUTH');
  if (/429/.test(msg)) return new AIError(msg, 'RATE_LIMIT');
  if (/safety/i.test(msg)) return new AIError(msg, 'SAFETY');
  if (/network|fetch|timeout/i.test(msg)) return new AIError(msg, 'NETWORK');
  return new AIError(msg, 'UNKNOWN');
}