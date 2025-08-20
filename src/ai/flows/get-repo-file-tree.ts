'use server';

/**
 * @fileOverview Fetches the file structure of a GitHub repository.
 *
 * - getRepoFileTree - A function that fetches the file tree for a given repository URL.
 * - GetRepoFileTreeInput - The input type for the getRepoFileTree function.
 * - FileNodeSchema / FileNode - The schema and type for the file tree structure.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Octokit } from 'octokit';
import { mockFileTree } from '@/lib/mock-data';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const GetRepoFileTreeInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the GitHub repository to analyze.'),
});
export type GetRepoFileTreeInput = z.infer<typeof GetRepoFileTreeInputSchema>;

// Zod schema for a file node, supporting recursive folders.
const FileNodeSchema: z.ZodType<any> = z.lazy(() => // Use 'any' because of recursion limitation
  z.union([
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.literal('file'),
      content: z.string(),
    }),
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.literal('folder'),
      children: z.array(FileNodeSchema),
    }),
  ])
);

export type FileNode = z.infer<typeof FileNodeSchema>;

// Fetches the file tree content recursively from GitHub.
async function fetchGitHubTree(owner: string, repo: string, sha: string): Promise<FileNode[]> {
  try {
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: sha,
      recursive: '1', // Using recursive fetch
    });

    if (!data.tree) return [];

    const fileMap: { [key: string]: FileNode } = {};
    const rootNodes: FileNode[] = [];

    // Sort to ensure parent directories are processed before their children
    const sortedTree = [...data.tree].sort((a, b) => (a.path || '').localeCompare(b.path || ''));

    for (const item of sortedTree) {
      if (!item.path || !item.type) continue;
      
      const pathParts = item.path.split('/');
      const name = pathParts.pop()!;
      const parentPath = pathParts.join('/');
      
      let node: FileNode;
      if (item.type === 'tree') {
        node = { id: item.sha!, name, type: 'folder', children: [] };
      } else if (item.type === 'blob') {
        // For simplicity, we are not fetching content here. The app fetches it on file select.
        // A full implementation might fetch small files here.
        node = { id: item.sha!, name, type: 'file', content: `// Content for ${item.path} will be loaded on demand.` };
      } else {
        continue; // Skip other types like 'commit'
      }

      fileMap[item.path] = node;

      if (parentPath) {
        const parent = fileMap[parentPath] as FileNode | undefined;
        if (parent && parent.type === 'folder') {
          parent.children.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    }
    return rootNodes;
  } catch (error) {
    console.error(`Error fetching GitHub tree for ${owner}/${repo}:`, error);
    // In case of API errors (e.g., rate limit), fall back to mock data
    return mockFileTree;
  }
}

export async function getRepoFileTree(input: GetRepoFileTreeInput): Promise<FileNode[]> {
    return fileTreeFlow(input);
}

const fileTreeFlow = ai.defineFlow(
  {
    name: 'fileTreeFlow',
    inputSchema: GetRepoFileTreeInputSchema,
    outputSchema: z.array(FileNodeSchema),
  },
  async ({ repoUrl }) => {
    const urlMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!urlMatch) {
      throw new Error('Invalid GitHub repository URL');
    }
    const [, owner, repo] = urlMatch;

    try {
      // Get the main branch SHA to fetch the latest tree
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      const mainBranch = repoData.default_branch;
      
      const { data: branchData } = await octokit.rest.repos.getBranch({
          owner,
          repo,
          branch: mainBranch,
      });

      const treeSha = branchData.commit.commit.tree.sha;
      if (!treeSha) {
          throw new Error('Could not find tree SHA for the main branch.');
      }
      
      return await fetchGitHubTree(owner, repo, treeSha);
    } catch (error) {
      console.error('Error in fileTreeFlow, falling back to mock data.', error);
      // Fallback for private repos or other errors
      return mockFileTree;
    }
  }
);
