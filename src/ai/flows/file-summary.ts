'use server';

/**
 * @fileOverview Provides AI-powered file summaries and insights for better code navigation.
 *
 * - generateFileSummary - A function that generates a concise summary of a file's purpose and key components.
 * - FileSummaryInput - The input type for the generateFileSummary function.
 * - FileSummaryOutput - The return type for the generateFileSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FileSummaryInputSchema = z.object({
  fileName: z.string().describe('The name of the file to analyze.'),
  filePath: z.string().describe('The full path to the file.'),
  fileContent: z.string().describe('The content of the file to summarize.'),
  projectContext: z.string().optional().describe('Optional context about the project structure.'),
});
export type FileSummaryInput = z.infer<typeof FileSummaryInputSchema>;

const FileSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the file\'s purpose and functionality.'),
  keyComponents: z.array(z.string()).describe('List of key functions, classes, or components in the file.'),
  purpose: z.string().describe('The main purpose or role of this file in the project.'),
  complexity: z.enum(['low', 'medium', 'high']).describe('Estimated complexity level of the file.'),
  tags: z.array(z.string()).describe('Relevant tags or categories for this file (e.g., "component", "utility", "config").'),
});
export type FileSummaryOutput = z.infer<typeof FileSummaryOutputSchema>;

export async function generateFileSummary(input: FileSummaryInput): Promise<FileSummaryOutput> {
  try {
    // Validate input
    if (!input.fileContent?.trim()) {
      throw new Error('File content cannot be empty');
    }
    
    if (!input.fileName?.trim()) {
      throw new Error('File name is required');
    }
    
    // Limit file size to prevent overwhelming the AI
    const maxFileSize = 50000; // ~50KB of text
    if (input.fileContent.length > maxFileSize) {
      throw new Error('File too large for analysis. Please select a smaller file or specific sections.');
    }
    
    const result = await fileSummaryFlow(input);
    return result;
  } catch (error) {
    console.error('Error in generateFileSummary:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('File content cannot be empty')) {
        throw new Error('Cannot analyze empty file. Please select a file with content.');
      } else if (error.message.includes('File too large')) {
        throw error; // Re-throw as-is
      } else if (error.message.includes('timeout')) {
        throw new Error('File analysis timed out. The file might be too complex or large.');
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        throw new Error('Too many analysis requests. Please wait before analyzing more files.');
      }
    }
    
    throw new Error('Unable to analyze file. This might be due to file complexity or service limitations.');
  }
}

const fileSummaryPrompt = ai.definePrompt({
  name: 'fileSummaryPrompt',
  input: {schema: FileSummaryInputSchema},
  output: {schema: FileSummaryOutputSchema},
  prompt: `You are an expert code analyst. Analyze the provided file and generate a concise, helpful summary.

**File:** {{{fileName}}}
**Path:** {{{filePath}}}
{{#if projectContext}}
**Project Context:** {{{projectContext}}}
{{/if}}

**File Content:**
\`\`\`
{{{fileContent}}}
\`\`\`

Analyze this file and provide:

## Summary
A 2-3 sentence overview of what this file does and its role in the project.

## Key Components
List the main functions, classes, components, or exports (up to 10 most important items).

## Purpose
Describe the primary purpose or responsibility of this file in one clear sentence.

## Complexity
Assess the complexity as:
- "low": Simple files with basic logic, configurations, or straightforward components
- "medium": Files with moderate logic, multiple functions, or some advanced patterns
- "high": Complex files with intricate logic, many dependencies, or advanced architectural patterns

## Tags
Provide 3-5 relevant tags that categorize this file (e.g., "component", "utility", "config", "api", "types", "test", "styling", "routing", etc.).

Focus on being concise but informative. Help developers quickly understand what this file does and whether it's relevant to their current task.`,
});

const fileSummaryFlow = ai.defineFlow(
  {
    name: 'fileSummaryFlow',
    inputSchema: FileSummaryInputSchema,
    outputSchema: FileSummaryOutputSchema,
  },
  async input => {
    const {output} = await fileSummaryPrompt(input);
    return output!;
  }
);