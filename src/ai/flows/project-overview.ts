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
  return projectOverviewFlow(input);
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
