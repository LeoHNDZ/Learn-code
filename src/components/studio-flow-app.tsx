
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Github, BookOpen, LoaderCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { generateProjectOverview } from '@/ai/flows/project-overview';
import { getRepoFileTree } from '@/ai/flows/get-repo-file-tree';
import { getFileContent } from '@/ai/flows/get-file-content';
import { useToast } from '@/hooks/use-toast';
import { LazyFileTree } from '@/components/lazy-file-tree';
import { CodeView } from '@/components/code-view';
import { Settings, type AppSettings } from '@/components/settings';
import { CodeComparison } from '@/components/code-comparison';
import { ChatExample } from '@/components/ChatExample';
import { countFiles, type FileNode, mockFileTreeWithPlaceholders } from '@/lib/mock-data';
import { isValidGitHubUrl, normalizeGitHubUrl } from '@/lib/utils-extra';

export function StudioFlowApp() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/LeoHNDZ/studio');
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState('');
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string; } | null>(null);
  const [viewedFiles, setViewedFiles] = useState<Set<string>>(new Set());
  const [isLoadingFileContent, setIsLoadingFileContent] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('studioflow-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Settings shortcut (Ctrl/Cmd + ,)
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault();
        // Trigger settings modal - we'd need to pass a ref or state to Settings component
        toast({
          title: 'Keyboard Shortcut',
          description: 'Settings: Click the gear icon in the header',
        });
      }
      
      // Help shortcut (Ctrl/Cmd + ?)
      if ((event.ctrlKey || event.metaKey) && event.key === '?') {
        event.preventDefault();
        toast({
          title: 'Keyboard Shortcuts',
          description: 'Ctrl/Cmd + , for Settings, Ctrl/Cmd + ? for Help, Tab to navigate',
        });
      }
      
      // Focus search (Ctrl/Cmd + K)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const repoInput = document.querySelector('input[placeholder*="GitHub"]') as HTMLInputElement;
        if (repoInput) {
          repoInput.focus();
          repoInput.select();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toast]);

  const totalFiles = useMemo(() => countFiles(fileTree), [fileTree]);
  const progress = totalFiles > 0 ? (viewedFiles.size / totalFiles) * 100 : 0;

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    
    // Apply theme changes immediately for better user experience
    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newSettings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme detection and application
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const handleAnalyzeRepo = async () => {
    // Input validation with user-friendly error messages
    if (!repoUrl || !repoUrl.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter a repository URL.", 
        variant: "destructive" 
      });
      return;
    }
    
    // Enhanced URL validation using proper validation function
    if (!isValidGitHubUrl(repoUrl)) {
      let errorMessage = "Please enter a valid GitHub repository URL.";
      
      if (!repoUrl.includes('github.com')) {
        errorMessage = "Only GitHub repository URLs are supported. Please use a URL like: https://github.com/owner/repository";
      } else if (!repoUrl.startsWith('https://')) {
        errorMessage = "Please use HTTPS URLs. Example: https://github.com/owner/repository";
      } else {
        errorMessage = "Invalid GitHub URL format. Please use: https://github.com/owner/repository";
      }
      
      toast({ 
        title: "Invalid URL", 
        description: errorMessage, 
        variant: "destructive" 
      });
      return;
    }
    
    setIsLoading(true);
    setFileTree([]);
    setSelectedFile(null);
    setIsDemoMode(false);

    try {
      // Normalize the URL for API processing (removes .git, query params, paths)
      const normalizedUrl = normalizeGitHubUrl(repoUrl);
      
      // Fetch repo data in parallel
      const [overviewResult, filesResult] = await Promise.all([
        generateProjectOverview({ repoUrl: normalizedUrl }),
        getRepoFileTree({ repoUrl: normalizedUrl })
      ]);

      setOverview(overviewResult.overview);
      setFileTree(filesResult);
      setIsOverviewOpen(true);
      setViewedFiles(new Set()); // Reset progress tracking
    } catch (error) {
      console.error(error);
      
      // Enhanced error handling with specific error types
      let errorTitle = "Analysis Failed";
      let errorMessage = "Unable to analyze the repository. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: errorTitle, 
        description: errorMessage, 
        variant: "destructive" 
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to update file content in the file tree
  const updateFileContentInTree = useCallback((fileId: string, newContent: string): FileNode[] => {
    const updateNode = (node: FileNode): FileNode => {
      if (node.type === 'file' && node.id === fileId) {
        return { ...node, content: newContent };
      } else if (node.type === 'folder') {
        return { ...node, children: node.children.map(updateNode) };
      }
      return node;
    };
    
    return fileTree.map(updateNode);
  }, [fileTree]);

  // Demo mode to test lazy loading with mock data
  const loadDemoData = useCallback(() => {
    setFileTree(mockFileTreeWithPlaceholders);
    setSelectedFile(null);
    setViewedFiles(new Set());
    setIsDemoMode(true);
    setOverview('Demo repository with lazy loading functionality. Files with placeholder content will be "loaded" when clicked.');
    setIsOverviewOpen(true);
    
    toast({
      title: "Demo mode loaded",
      description: "Click on files with placeholder content to test lazy loading.",
    });
  }, [toast]);

  // Simulate file content for demo mode
  const simulateFileContent = useCallback((filePath: string): string => {
    const fileName = filePath.split('/').pop() || '';
    
    if (fileName === 'button.tsx') {
      return `import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props 
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'outline' && "border border-input bg-background hover:bg-accent",
        variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
        size === 'default' && "h-10 px-4 py-2",
        size === 'sm' && "h-9 rounded-md px-3",
        size === 'lg' && "h-11 rounded-md px-8",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};`;
    } else if (fileName === 'input.tsx') {
      return `import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
            "text-sm ring-offset-background file:border-0 file:bg-transparent",
            "file:text-sm file:font-medium placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";`;
    } else if (fileName === 'utils.ts') {
      return `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return \`\${size.toFixed(1)} \${units[unitIndex]}\`;
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}`;
    } else if (fileName === 'package.json') {
      return `{
  "name": "demo-project",
  "version": "1.0.0",
  "description": "A demo project showcasing lazy loading functionality",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "clsx": "^2.0.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}`;
    }
    
    return `// Simulated content for ${filePath}
// This content was lazy-loaded successfully!

export default function ExampleComponent() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Lazy Loaded Content</h2>
      <p>This content was loaded on demand when you clicked the file.</p>
      <p>File: {filePath}</p>
    </div>
  );
}`;
  }, []);

  // Check if content is a placeholder
  const isPlaceholderContent = useCallback((content: string): boolean => {
    return content.includes('will be loaded on demand.');
  }, []);

  // Memoized file selection handler with lazy loading
  const handleFileSelect = useCallback(async (file: { path: string, content: string, id: string }) => {
    // Set the selected file immediately (might be placeholder content)
    setSelectedFile({ path: file.path, content: file.content });
    // Update progress tracking by adding the file ID to viewed set
    setViewedFiles(prev => new Set(prev).add(file.id));

    // If content is a placeholder, fetch the real content
    if (isPlaceholderContent(file.content)) {
      setIsLoadingFileContent(true);
      
      try {
        let newContent: string;
        
        // Check if we're in demo mode
        if (isDemoMode) {
          // Simulate loading delay for demo
          await new Promise(resolve => setTimeout(resolve, 1500));
          newContent = simulateFileContent(file.path);
        } else {
          // Real GitHub API call
          const fileContentResult = await getFileContent({
            repoUrl: repoUrl,
            filePath: file.path.startsWith('/') ? file.path.slice(1) : file.path,
            fileId: file.id,
          });
          newContent = fileContentResult.content;
        }

        // Update the file tree with the real content
        const updatedTree = updateFileContentInTree(file.id, newContent);
        setFileTree(updatedTree);

        // Update the selected file with the real content
        setSelectedFile({ path: file.path, content: newContent });

        toast({
          title: "File loaded",
          description: `Successfully loaded content for ${file.path}`,
        });
      } catch (error) {
        console.error('Error loading file content:', error);
        
        let errorMessage = 'Failed to load file content.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Failed to load file",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingFileContent(false);
      }
    }
  }, [repoUrl, isPlaceholderContent, updateFileContentInTree, simulateFileContent, fileTree, isDemoMode, toast]);

  const projectStructureString = useMemo(() => JSON.stringify(fileTree, null, 2), [fileTree]);

  return (
    <SidebarProvider>
      <div className="relative min-h-screen w-full bg-background md:ml-[var(--sidebar-width-icon)]">
        {/* Main navigation sidebar with file tree */}
        <Sidebar className="sidebar-transition" aria-label="File navigation">
          <SidebarContent className="p-0">
             <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Sparkles className="text-primary" aria-hidden="true" />
                    <h2 className="text-lg font-semibold">StudioFlow</h2>
                </div>
            </SidebarHeader>
            {fileTree.length > 0 ? (
              <div className="p-2" role="navigation" aria-label="Repository file tree">
                <LazyFileTree 
                  nodes={fileTree} 
                  onFileSelect={handleFileSelect} 
                  maxInitialItems={8}
                  enableKeyboardNavigation={settings?.enableSmoothTransitions !== false}
                />
              </div>
            ) : (
                <div className="p-4 text-sm text-muted-foreground" role="status">
                    {isLoading ? 'Loading file tree...' : 'Enter a repository URL to start exploring the codebase.'}
                </div>
            )}
          </SidebarContent>
        </Sidebar>

        {/* Main content area */}
        <SidebarInset>
          <main className="p-4 md:p-6 space-y-4" role="main">
            {/* Repository analysis controls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle className="text-lg font-medium">Codebase Analysis</CardTitle>
                 <div className="flex items-center gap-2">
                   <Settings onSettingsChange={handleSettingsChange} />
                   <SidebarTrigger className="md:hidden" aria-label="Toggle sidebar"/>
                 </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-grow flex items-center gap-2">
                    <Github className="text-muted-foreground" aria-hidden="true" />
                    <Input
                      placeholder="Enter GitHub repository URL (e.g., https://github.com/owner/repo)"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      disabled={isLoading}
                      aria-label="Repository URL input"
                      aria-describedby="repo-url-help"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAnalyzeRepo} 
                      disabled={isLoading}
                      aria-describedby="analyze-button-help"
                    >
                      {isLoading ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" /> 
                          Analyze Repository
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={loadDemoData} 
                      disabled={isLoading}
                    >
                      <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                      Demo Mode
                    </Button>
                  </div>
                </div>
                <div id="repo-url-help" className="sr-only">
                  Enter a public GitHub repository URL to analyze its structure and get AI-powered insights
                </div>
                <div id="analyze-button-help" className="sr-only">
                  Click to start analyzing the repository and load its file structure
                </div>
                
                {/* Progress tracking display */}
                {fileTree.length > 0 && (
                    <div className="mt-4" role="region" aria-label="Exploration progress">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-muted-foreground">Exploration Progress</span>
                            <span className="text-sm font-semibold text-accent-foreground" aria-live="polite">
                              {viewedFiles.size} / {totalFiles} files
                            </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="w-full [&>div]:bg-accent progress-bar" 
                          aria-label={`Progress: ${viewedFiles.size} of ${totalFiles} files explored`}
                        />
                    </div>
                )}
              </CardContent>
            </Card>

            {/* Code viewer and analysis area */}
            {selectedFile ? (
              <div className="space-y-4" role="region" aria-label="Code viewer">
                 <div className="flex justify-end">
                    <CodeComparison 
                      files={fileTree} 
                      currentFile={selectedFile}
                    />
                </div>
                {isLoadingFileContent ? (
                  <Card>
                    <CardContent className="flex items-center justify-center p-10">
                      <div className="flex items-center gap-2">
                        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-muted-foreground">Loading file content...</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <CodeView 
                    filePath={selectedFile.path}
                    code={selectedFile.content}
                    projectStructure={projectStructureString}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center text-center p-10 border-2 border-dashed rounded-lg h-96" role="status">
                <div>
                  <h3 className="text-xl font-semibold text-muted-foreground">Select a file to begin</h3>
                  <p className="text-muted-foreground mt-2">
                    Choose a file from the navigator on the left to view its content and get AI-powered explanations.
                  </p>
                </div>
              </div>
            )}
             {/* AI Chat Example - New feature demonstration */}
            {fileTree.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">AI Chat Demo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Try the new AI chat feature below. This demonstrates the clean AI architecture layer.
                    </p>
                    <ChatExample />
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>

        {/* Project overview modal dialog */}
        <AlertDialog open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
          <AlertDialogContent className="max-w-2xl modal-transition" role="dialog" aria-labelledby="overview-title">
            <AlertDialogHeader>
              <AlertDialogTitle id="overview-title" className="flex items-center gap-2">
                <BookOpen aria-hidden="true" /> Project Overview
              </AlertDialogTitle>
              <AlertDialogDescription>
                Here is a high-level overview of the project&apos;s architecture, key components, and data flow.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4 text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-md" role="region" aria-label="Project overview content">
              {overview}
            </div>
            <AlertDialogFooter>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
}
