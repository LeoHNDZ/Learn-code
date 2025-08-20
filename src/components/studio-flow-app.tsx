
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
import { useToast } from '@/hooks/use-toast';
import { LazyFileTree } from '@/components/lazy-file-tree';
import { CodeView } from '@/components/code-view';
import { Settings, type AppSettings } from '@/components/settings';
import { CodeComparison } from '@/components/code-comparison';
import { ChatExample } from '@/components/ChatExample';
import { countFiles, type FileNode } from '@/lib/mock-data';
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
        // Handle specific error types
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorTitle = "Repository Not Found";
          errorMessage = "The repository could not be found. Please check that the URL is correct and the repository is public.";
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorTitle = "Access Denied";
          errorMessage = "Access to this repository is restricted. It might be private or require a GITHUB_TOKEN environment variable with access rights.";
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorTitle = "Rate Limit Exceeded";
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorTitle = "Network Error";
          errorMessage = "Unable to connect to the repository. Please check your internet connection and try again.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
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

  // Memoized file selection handler to prevent unnecessary re-renders
  const handleFileSelect = useCallback((file: { path: string, content: string, id: string }) => {
    setSelectedFile({ path: file.path, content: file.content });
    // Update progress tracking by adding the file ID to viewed set
    setViewedFiles(prev => new Set(prev).add(file.id));
  }, []);

  const projectStructureString = useMemo(() => JSON.stringify(fileTree, null, 2), [fileTree]);

  return (
    <SidebarProvider>
      <div className="relative min-h-screen w-full bg-background">
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
                <CodeView 
                  filePath={selectedFile.path}
                  code={selectedFile.content}
                  projectStructure={projectStructureString}
                />
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
