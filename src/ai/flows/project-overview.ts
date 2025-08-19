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
  prompt: `You are an expert software architect and code analyst. You will analyze a GitHub repository and provide a comprehensive, well-structured overview.

**Repository URL**: {{{repoUrl}}}

Please analyze this repository and provide a detailed overview covering:

## 🏗️ Architecture Overview
- Primary framework/technology stack
- Overall architectural pattern (MVC, microservices, etc.)
- Key design decisions and patterns used

## 📁 Project Structure
- Main directories and their purposes
- Configuration files and their roles
- Entry points and important files

## 🔧 Core Components
- Main modules and their responsibilities
- Key classes, functions, or components
- Dependencies and how they interact

## 📊 Data Flow
- How data moves through the application
- API endpoints or data sources
- State management approach

## 🚀 Key Features
- Primary functionality and capabilities
- User-facing features
- Technical highlights

## 🛠️ Development Setup
- Prerequisites and dependencies
- Build and deployment process
- Testing approach

Provide a clear, concise analysis that helps developers quickly understand what this project does and how it's organized. Focus on the most important aspects that would help someone new to the codebase get oriented.`,
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
