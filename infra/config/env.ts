import { z } from 'zod';

const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(10, 'Missing GEMINI_API_KEY'),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  GEMINI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().max(8192).default(1024)
});

export const Env = EnvSchema.parse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  GEMINI_MAX_OUTPUT_TOKENS: process.env.GEMINI_MAX_OUTPUT_TOKENS
});