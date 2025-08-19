'use server';

/**
 * @fileOverview Provides AI-powered code suggestions and improvement recommendations.
 *
 * - generateCodeSuggestions - A function that analyzes code and provides improvement suggestions.
 * - CodeSuggestionsInput - The input type for the generateCodeSuggestions function.
 * - CodeSuggestionsOutput - The return type for the generateCodeSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeSuggestionsInputSchema = z.object({
  code: z.string().describe('The code block to analyze for improvements.'),
  filePath: z.string().describe('The path to the file containing the code.'),
  language: z.string().optional().describe('Programming language (auto-detected if not provided).'),
  context: z.string().optional().describe('Additional context about the code\'s purpose or requirements.'),
});
export type CodeSuggestionsInput = z.infer<typeof CodeSuggestionsInputSchema>;

const SuggestionSchema = z.object({
  type: z.enum(['performance', 'readability', 'security', 'best-practice', 'type-safety', 'maintainability']).describe('Category of the suggestion.'),
  priority: z.enum(['low', 'medium', 'high']).describe('Priority level of the suggestion.'),
  title: z.string().describe('Brief title of the suggestion.'),
  description: z.string().describe('Detailed explanation of the suggestion.'),
  example: z.string().optional().describe('Example of improved code (if applicable).'),
});

const CodeSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('List of improvement suggestions.'),
  overallQuality: z.enum(['excellent', 'good', 'fair', 'needs-improvement']).describe('Overall code quality assessment.'),
  summary: z.string().describe('Brief summary of the analysis and key recommendations.'),
});
export type CodeSuggestionsOutput = z.infer<typeof CodeSuggestionsOutputSchema>;

export async function generateCodeSuggestions(input: CodeSuggestionsInput): Promise<CodeSuggestionsOutput> {
  try {
    // Validate input
    if (!input.code?.trim()) {
      throw new Error('Code cannot be empty');
    }
    
    if (!input.filePath?.trim()) {
      throw new Error('File path is required for context');
    }
    
    // Limit code size to prevent overwhelming the AI
    const maxCodeSize = 30000; // ~30KB of code
    if (input.code.length > maxCodeSize) {
      throw new Error('Code block too large for analysis. Please select a smaller section.');
    }
    
    const result = await codeSuggestionsFlow(input);
    return result;
  } catch (error) {
    console.error('Error in generateCodeSuggestions:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Code cannot be empty')) {
        throw new Error('Please provide code to analyze for suggestions.');
      } else if (error.message.includes('Code block too large')) {
        throw error; // Re-throw as-is
      } else if (error.message.includes('timeout')) {
        throw new Error('Code analysis timed out. Try analyzing a smaller code section.');
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        throw new Error('Too many analysis requests. Please wait before requesting more suggestions.');
      }
    }
    
    throw new Error('Unable to analyze code for suggestions. This might be due to code complexity or service limitations.');
  }
}

const codeSuggestionsPrompt = ai.definePrompt({
  name: 'codeSuggestionsPrompt',
  input: {schema: CodeSuggestionsInputSchema},
  output: {schema: CodeSuggestionsOutputSchema},
  prompt: `You are an expert code reviewer and software architect. Analyze the provided code and offer specific, actionable improvement suggestions.

**File:** {{{filePath}}}
{{#if language}}
**Language:** {{{language}}}
{{/if}}
{{#if context}}
**Context:** {{{context}}}
{{/if}}

**Code to Analyze:**
\`\`\`
{{{code}}}
\`\`\`

Provide a comprehensive analysis focusing on:

## Code Analysis
Examine the code for potential improvements in these areas:

### 🚀 Performance
- Algorithmic efficiency
- Memory usage
- Unnecessary computations
- Optimization opportunities

### 📖 Readability & Maintainability
- Code clarity and organization
- Naming conventions
- Documentation needs
- Code structure

### 🔒 Security
- Potential vulnerabilities
- Input validation
- Data handling best practices

### ✅ Best Practices
- Language-specific conventions
- Design patterns
- Error handling
- Testing considerations

### 🛡️ Type Safety (if applicable)
- Type annotations
- Null safety
- Type checking improvements

## Assessment
Provide:
1. **Suggestions**: Specific, actionable recommendations with examples when helpful
2. **Overall Quality**: Rate the code quality
3. **Summary**: Key takeaways and most important improvements

Focus on practical suggestions that would make the biggest impact on code quality and maintainability.`,
});

const codeSuggestionsFlow = ai.defineFlow(
  {
    name: 'codeSuggestionsFlow',
    inputSchema: CodeSuggestionsInputSchema,
    outputSchema: CodeSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await codeSuggestionsPrompt(input);
    return output!;
  }
);