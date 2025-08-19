/**
 * Basic tests for StudioFlow utility functions
 * Run with: npm test (after setting up a test runner)
 */

import { 
    countFiles, 
    isValidGitHubUrl, 
    normalizeGitHubUrl,
    calculateProgress, 
    formatFileSize, 
    debounce 
} from '../src/lib/utils-extra';
import type { FileNode } from '../src/lib/mock-data';

// Mock file tree for testing
const mockFileTree: FileNode[] = [
    {
        id: '1',
        name: 'src',
        type: 'folder',
        children: [
            {
                id: '2',
                name: 'app.tsx',
                type: 'file',
                content: 'export default function App() { return <div>App</div>; }'
            },
            {
                id: '3',
                name: 'utils',
                type: 'folder',
                children: [
                    {
                        id: '4',
                        name: 'helper.ts',
                        type: 'file',
                        content: 'export function helper() { return "help"; }'
                    }
                ]
            }
        ]
    },
    {
        id: '5',
        name: 'package.json',
        type: 'file',
        content: '{ "name": "test-app" }'
    }
];

// Simple test framework functions
function assertEqual(actual: any, expected: any, message: string): void {
    if (actual === expected) {
        console.log(`✅ PASS: ${message}`);
    } else {
        console.error(`❌ FAIL: ${message}`);
        console.error(`  Expected: ${expected}`);
        console.error(`  Actual: ${actual}`);
    }
}

function assertTrue(condition: boolean, message: string): void {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
    } else {
        console.error(`❌ FAIL: ${message}`);
    }
}

function assertFalse(condition: boolean, message: string): void {
    if (!condition) {
        console.log(`✅ PASS: ${message}`);
    } else {
        console.error(`❌ FAIL: ${message}`);
    }
}

// Test countFiles function
function testCountFiles(): void {
    console.log('\n=== Testing countFiles function ===');
    
    const fileCount = countFiles(mockFileTree);
    assertEqual(fileCount, 3, 'Should count 3 files in mock tree');
    
    const emptyCount = countFiles([]);
    assertEqual(emptyCount, 0, 'Should return 0 for empty array');
}

// Test isValidGitHubUrl function
function testIsValidGitHubUrl(): void {
    console.log('\n=== Testing isValidGitHubUrl function ===');
    
    // Valid URLs - basic cases
    assertTrue(
        isValidGitHubUrl('https://github.com/user/repo'), 
        'Should validate basic GitHub URL'
    );
    assertTrue(
        isValidGitHubUrl('https://github.com/user-name/repo-name'), 
        'Should validate GitHub URL with dashes'
    );
    assertTrue(
        isValidGitHubUrl('https://github.com/user.name/repo.name'), 
        'Should validate GitHub URL with dots'
    );
    
    // Valid URLs - edge cases for improved validation
    assertTrue(
        isValidGitHubUrl('https://github.com/LeoHNDZ/studio'), 
        'Should validate the specific URL mentioned in the issue'
    );
    assertTrue(
        isValidGitHubUrl('https://github.com/user/repo.git'), 
        'Should validate GitHub URL with .git suffix'
    );
    assertTrue(
        isValidGitHubUrl('https://github.com/user/repo?ref=main'), 
        'Should validate GitHub URL with query parameters'
    );
    assertTrue(
        isValidGitHubUrl('https://github.com/user/repo/tree/main'), 
        'Should validate GitHub URL with path segments'
    );
    assertTrue(
        isValidGitHubUrl('https://github.com/user/repo/blob/main/README.md'), 
        'Should validate GitHub URL with file paths'
    );
    assertTrue(
        isValidGitHubUrl('https://github.com/user/repo?tab=readme'), 
        'Should validate GitHub URL with tab parameter'
    );
    assertTrue(
        isValidGitHubUrl('https://github.com/user/repo/'), 
        'Should validate GitHub URL with trailing slash'
    );
    
    // Invalid URLs
    assertFalse(
        isValidGitHubUrl('https://gitlab.com/user/repo'), 
        'Should reject non-GitHub URLs'
    );
    assertFalse(
        isValidGitHubUrl('not-a-url'), 
        'Should reject invalid URLs'
    );
    assertFalse(
        isValidGitHubUrl(''), 
        'Should reject empty strings'
    );
    assertFalse(
        isValidGitHubUrl('https://github.com/'), 
        'Should reject incomplete GitHub URLs'
    );
    assertFalse(
        isValidGitHubUrl('http://github.com/user/repo'), 
        'Should reject non-HTTPS URLs'
    );
}

// Test normalizeGitHubUrl function
function testNormalizeGitHubUrl(): void {
    console.log('\n=== Testing normalizeGitHubUrl function ===');
    
    assertEqual(
        normalizeGitHubUrl('https://github.com/user/repo'), 
        'https://github.com/user/repo',
        'Should return basic URL unchanged'
    );
    assertEqual(
        normalizeGitHubUrl('https://github.com/user/repo.git'), 
        'https://github.com/user/repo',
        'Should remove .git suffix'
    );
    assertEqual(
        normalizeGitHubUrl('https://github.com/user/repo?ref=main'), 
        'https://github.com/user/repo',
        'Should remove query parameters'
    );
    assertEqual(
        normalizeGitHubUrl('https://github.com/user/repo/tree/main'), 
        'https://github.com/user/repo',
        'Should remove path segments'
    );
    assertEqual(
        normalizeGitHubUrl('https://github.com/user/repo/blob/main/README.md'), 
        'https://github.com/user/repo',
        'Should remove file paths'
    );
    assertEqual(
        normalizeGitHubUrl('https://github.com/LeoHNDZ/studio'), 
        'https://github.com/LeoHNDZ/studio',
        'Should handle the specific issue URL correctly'
    );
    assertEqual(
        normalizeGitHubUrl('invalid-url'), 
        'invalid-url',
        'Should return invalid URLs unchanged'
    );
}

// Test calculateProgress function
function testCalculateProgress(): void {
    console.log('\n=== Testing calculateProgress function ===');
    
    const viewedFiles = new Set(['1', '2']);
    const progress = calculateProgress(viewedFiles, 10);
    assertEqual(progress, 20, 'Should calculate 20% progress for 2/10 files');
    
    const emptyProgress = calculateProgress(new Set(), 0);
    assertEqual(emptyProgress, 0, 'Should return 0% for zero total files');
    
    const fullProgress = calculateProgress(new Set(['1', '2', '3']), 3);
    assertEqual(fullProgress, 100, 'Should return 100% for all files viewed');
}

// Test formatFileSize function
function testFormatFileSize(): void {
    console.log('\n=== Testing formatFileSize function ===');
    
    assertEqual(formatFileSize(0), '0 Bytes', 'Should format 0 bytes');
    assertEqual(formatFileSize(1024), '1 KB', 'Should format 1 KB');
    assertEqual(formatFileSize(1048576), '1 MB', 'Should format 1 MB');
    assertEqual(formatFileSize(500), '500 Bytes', 'Should format bytes');
}

// Test debounce function
function testDebounce(): void {
    console.log('\n=== Testing debounce function ===');
    
    let callCount = 0;
    const testFunction = () => { callCount++; };
    const debouncedFunction = debounce(testFunction, 50);
    
    // Call multiple times quickly
    debouncedFunction();
    debouncedFunction();
    debouncedFunction();
    
    // Should only be called once after delay
    setTimeout(() => {
        assertEqual(callCount, 1, 'Debounced function should only be called once');
    }, 100);
}

// Run all tests
function runTests(): void {
    console.log('🧪 Starting StudioFlow Utility Tests...\n');
    
    testCountFiles();
    testIsValidGitHubUrl();
    testNormalizeGitHubUrl();
    testCalculateProgress();
    testFormatFileSize();
    testDebounce();
    
    console.log('\n✨ Tests completed! Check results above.');
}

// Export for potential test runner integration
export {
    testCountFiles,
    testIsValidGitHubUrl,
    testNormalizeGitHubUrl,
    testCalculateProgress,
    testFormatFileSize,
    testDebounce,
    runTests
};

// Run tests if this file is executed directly
if (typeof window === 'undefined' && typeof global !== 'undefined') {
    runTests();
}