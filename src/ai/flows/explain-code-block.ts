// src/ai/flows/explain-code-block.ts
'use server';

/**
 * @fileOverview Explains a selected block of code in plain language, considering surrounding context and project structure.
 *
 * - explainCodeBlock - A function that handles the code explanation process.
 * - ExplainCodeBlockInput - The input type for the explainCodeBlock function.
 * - ExplainCodeBlockOutput - The return type for the explainCodeBlock function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCodeBlockInputSchema = z.object({
  code: z.string().describe('The code block to explain.'),
  filePath: z.string().describe('The path to the file containing the code block.'),
  projectStructure: z.string().describe('The project structure to provide context.'),
});
export type ExplainCodeBlockInput = z.infer<typeof ExplainCodeBlockInputSchema>;

const ExplainCodeBlockOutputSchema = z.object({
  explanation: z.string().describe('A plain language explanation of the code block.'),
});
export type ExplainCodeBlockOutput = z.infer<typeof ExplainCodeBlockOutputSchema>;

export async function explainCodeBlock(input: ExplainCodeBlockInput): Promise<ExplainCodeBlockOutput> {
  try {
    // Validate input before processing
    if (!input.code?.trim()) {
      throw new Error('Code block cannot be empty');
    }
    
    if (!input.filePath?.trim()) {
      throw new Error('File path is required for context');
    }
    
    const result = await explainCodeBlockFlow(input);
    return result;
  } catch (error) {
    console.error('Error in explainCodeBlock:', error);
    
    // Enhanced error handling with specific error types
    if (error instanceof Error) {
      if (error.message.includes('Code block cannot be empty')) {
        throw new Error('Please select a valid code block to explain.');
      } else if (error.message.includes('File path is required')) {
        throw new Error('Unable to provide context - file path missing.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Code explanation timed out. The code block might be too complex. Try selecting a smaller section.');
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        throw new Error('Too many requests. Please wait a moment before requesting another explanation.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
    }
    
    // Generic fallback for unexpected errors
    throw new Error('Unable to explain code block. This might be due to service limitations or complex code structure.');
  }
}

const prompt = ai.definePrompt({
  name: 'explainCodeBlockPrompt',
  input: {schema: ExplainCodeBlockInputSchema},
  output: {schema: ExplainCodeBlockOutputSchema},
  prompt: `You are an expert software developer and code mentor. Your task is to explain code in a clear, educational way that helps developers understand both what the code does and why it's written that way.

**Code to Explain:**
\`\`\`
{{{code}}}
\`\`\`

**File Context:** {{{filePath}}}

**Project Structure:**
{{{projectStructure}}}

Please provide a comprehensive explanation that includes:

## 🎯 Purpose & Functionality
- What does this code accomplish?
- What problem does it solve?

## 🔍 Line-by-Line Breakdown
- Explain key lines or sections
- Highlight important logic or patterns

## 🏗️ Technical Details
- Language features or APIs used
- Design patterns employed
- Dependencies or imports

## 🔗 Context & Relations
- How does this fit into the larger project?
- What other components does it interact with?
- Why might it be structured this way?

## 💡 Learning Points
- Key concepts developers should understand
- Best practices demonstrated
- Potential areas for improvement

Keep your explanation clear and educational, suitable for developers who want to understand both the "what" and the "why" of the code.`,
});

const explainCodeBlockFlow = ai.defineFlow(
  {
    name: 'explainCodeBlockFlow',
    inputSchema: ExplainCodeBlockInputSchema,
    outputSchema: ExplainCodeBlockOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
