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
  return explainCodeBlockFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCodeBlockPrompt',
  input: {schema: ExplainCodeBlockInputSchema},
  output: {schema: ExplainCodeBlockOutputSchema},
  prompt: `You are an expert software developer. Explain the following code block in plain language, taking into account the surrounding code and project structure.

Code Block:
\`\`\`
{{{code}}}
\`\`\`

File Path: {{{filePath}}}

Project Structure:
{{{projectStructure}}}

Explanation:`, // No function calls, NO Asynchronous Operations in Handlebars templates.
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
