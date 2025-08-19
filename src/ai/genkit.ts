import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Enhanced AI configuration with better error handling and performance optimization
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

// AI model configurations for different use cases
export const AI_MODELS = {
  // Fast model for quick responses (code explanations, simple queries)
  FAST: 'googleai/gemini-2.0-flash',
  // More capable model for complex analysis (project overviews, detailed summaries)
  ADVANCED: 'googleai/gemini-2.0-flash',
  // Future: could add other models for specialized tasks
} as const;

// Common AI configuration settings
export const AI_CONFIG = {
  // Response generation settings
  maxTokens: 2048,
  temperature: 0.7, // Balance between creativity and consistency
  topP: 0.8,
  
  // Timeout settings for different operations
  timeouts: {
    quickResponse: 10000, // 10s for simple explanations
    complexAnalysis: 30000, // 30s for project overviews
    fileProcessing: 15000, // 15s for file analysis
  },
  
  // Rate limiting to prevent API abuse
  rateLimits: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000,
  }
} as const;
