'use server';

/**
 * @fileOverview Fetches individual file content from GitHub repositories.
 *
 * - getFileContent - A function that fetches the content of a specific file from GitHub.
 * - GetFileContentInput - The input type for the getFileContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const GetFileContentInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the GitHub repository.'),
  filePath: z.string().describe('The path to the file within the repository.'),
  fileId: z.string().describe('The SHA/ID of the file (blob SHA).'),
});
export type GetFileContentInput = z.infer<typeof GetFileContentInputSchema>;

const GetFileContentOutputSchema = z.object({
  content: z.string().describe('The content of the file.'),
  encoding: z.string().describe('The encoding of the file content.'),
  size: z.number().describe('The size of the file in bytes.'),
});
export type GetFileContentOutput = z.infer<typeof GetFileContentOutputSchema>;

// Fetches individual file content from GitHub
async function fetchFileContentFromGitHub(
  owner: string, 
  repo: string, 
  filePath: string, 
  fileId: string
): Promise<GetFileContentOutput> {
  try {
    // First try to get the file content using the file path
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    // Handle the case where the API returns an array (shouldn't happen for files)
    if (Array.isArray(data)) {
      throw new Error('Expected file but got directory');
    }

    // Check if it's a file (not a directory)
    if (data.type !== 'file') {
      throw new Error('Path does not point to a file');
    }

    // Decode the content if it's base64 encoded
    let content = '';
    if (data.content && data.encoding === 'base64') {
      content = Buffer.from(data.content, 'base64').toString('utf-8');
    } else if (data.content) {
      content = data.content;
    }

    return {
      content,
      encoding: data.encoding || 'utf-8',
      size: data.size || 0,
    };
  } catch (error: any) {
    console.error(`Error fetching file content for ${filePath}:`, error);
    
    if (error.status === 404) {
      throw new Error(`File not found: ${filePath}`);
    } else if (error.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to your .env file.');
    } else if (error.status === 422 && error.message?.includes('too_large')) {
      throw new Error('File is too large to fetch content. Maximum size is 1MB.');
    }
    
    throw new Error(`Failed to fetch file content: ${error.message || 'Unknown error'}`);
  }
}

export async function getFileContent(input: GetFileContentInput): Promise<GetFileContentOutput> {
  return fileContentFlow(input);
}

const fileContentFlow = ai.defineFlow(
  {
    name: 'fileContentFlow',
    inputSchema: GetFileContentInputSchema,
    outputSchema: GetFileContentOutputSchema,
  },
  async ({ repoUrl, filePath, fileId }) => {
    const urlMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!urlMatch) {
      throw new Error('Invalid GitHub repository URL');
    }
    const [, owner, repo] = urlMatch;

    return await fetchFileContentFromGitHub(owner, repo, filePath, fileId);
  }
);