/**
 * Basic utility functions for StudioFlow application
 * These functions support file tree operations and progress tracking
 */

import type { FileNode } from '@/lib/mock-data';

/**
 * Counts the total number of files in a file tree structure
 * @param nodes - Array of FileNode objects representing the file tree
 * @returns Total number of files (excludes folders)
 */
export function countFiles(nodes: FileNode[]): number {
    let count = 0;
    for (const node of nodes) {
        if (node.type === 'file') {
            count++;
        } else if (node.type === 'folder') {
            count += countFiles(node.children);
        }
    }
    return count;
}

/**
 * Validates if a URL is a valid GitHub repository URL
 * @param url - The URL string to validate
 * @returns boolean indicating if the URL is valid
 */
export function isValidGitHubUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }
    
    const trimmedUrl = url.trim();
    
    // Enhanced GitHub URL validation that handles various GitHub URL formats
    // Matches: https://github.com/owner/repo with optional:
    // - .git suffix
    // - trailing slash
    // - query parameters (?ref=main, ?tab=readme, etc.)
    // - path segments (/tree/main, /blob/main/file.md, etc.)
    const githubUrlPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+(?:\.git)?(?:\/[^?]*)?(?:\?.*)?$/;
    
    return githubUrlPattern.test(trimmedUrl);
}

/**
 * Extracts the base repository URL from a GitHub URL
 * @param url - The GitHub URL to normalize
 * @returns Base repository URL or the original URL if extraction fails
 */
export function normalizeGitHubUrl(url: string): string {
    if (!url || typeof url !== 'string') {
        return url;
    }
    
    const trimmedUrl = url.trim();
    
    // Extract owner/repo from GitHub URL, handling .git suffix separately
    const match = trimmedUrl.match(/^https:\/\/github\.com\/([\w\-\.]+)\/([\w\-\.]+?)(?:\.git)?(?:\/.*)?(?:\?.*)?$/);
    
    if (match) {
        const [, owner, repo] = match;
        return `https://github.com/${owner}/${repo}`;
    }
    
    return trimmedUrl;
}

/**
 * Calculates progress percentage based on viewed files
 * @param viewedFiles - Set of viewed file IDs
 * @param totalFiles - Total number of files
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(viewedFiles: Set<string>, totalFiles: number): number {
    if (totalFiles === 0) return 0;
    return Math.round((viewedFiles.size / totalFiles) * 100);
}

/**
 * Formats file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounces a function call to prevent excessive executions
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}