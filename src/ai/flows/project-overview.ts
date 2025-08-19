'use server';
/**
 * @fileOverview Provides a high-level overview of the project's architecture, key components, and data flow.
 *
 * - generateProjectOverview - A function that generates the project overview.
 * - ProjectOverviewInput - The input type for the generateProjectOverview function.
 * - ProjectOverviewOutput - The return type for the generateProjectOverview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectOverviewInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the GitHub repository to analyze.'),
});
export type ProjectOverviewInput = z.infer<typeof ProjectOverviewInputSchema>;

const ProjectOverviewOutputSchema = z.object({
  overview: z.string().describe('A high-level overview of the project architecture, key components, and data flow.'),
});
export type ProjectOverviewOutput = z.infer<typeof ProjectOverviewOutputSchema>;

export async function generateProjectOverview(input: ProjectOverviewInput): Promise<ProjectOverviewOutput> {
  try {
    const result = await projectOverviewFlow(input);
    return result;
  } catch (error) {
    console.error('Error in generateProjectOverview:', error);
    
    // Enhanced error handling for different types of failures
    if (error instanceof Error) {
      // Check for specific error patterns and provide appropriate responses
      if (error.message.includes('404') || error.message.includes('not found')) {
        throw new Error('Repository not found. Please verify the URL and ensure the repository is public.');
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        throw new Error('Access denied. The repository might be private or you may have exceeded rate limits.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timed out. The repository might be too large or the service is currently slow.');
      }
    }
    
    // For any other errors, provide a generic fallback message
    throw new Error('Unable to analyze repository. This might be due to repository size, connectivity issues, or service limitations.');
  }
}

const projectOverviewPrompt = ai.definePrompt({
  name: 'projectOverviewPrompt',
  input: {schema: ProjectOverviewInputSchema},
  output: {schema: ProjectOverviewOutputSchema},
  prompt: `You are an AI expert in software architecture. You are given the URL of a public Github repository.
  You will analyze the repository and provide a high-level overview of the project's architecture, key components, and data flow.

  Github Repository URL: {{{repoUrl}}}
  `,
});

const projectOverviewFlow = ai.defineFlow(
  {
    name: 'projectOverviewFlow',
    inputSchema: ProjectOverviewInputSchema,
    outputSchema: ProjectOverviewOutputSchema,
  },
  async input => {
    const {output} = await projectOverviewPrompt(input);
    return output!;
  }
);
