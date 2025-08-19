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
import { useToast } from '@/hooks/use-toast';
import { FileTree } from '@/components/file-tree';
import { CodeView } from '@/components/code-view';
import { Settings, type AppSettings } from '@/components/settings';
import { CodeComparison } from '@/components/code-comparison';
import { mockFileTree, countFiles, type FileNode } from '@/lib/mock-data';

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

  const totalFiles = useMemo(() => countFiles(fileTree), [fileTree]);
  const progress = totalFiles > 0 ? (viewedFiles.size / totalFiles) * 100 : 0;

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    // Apply theme changes
    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newSettings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const handleAnalyzeRepo = async () => {
    if (!repoUrl) {
      toast({ 
        title: "Error", 
        description: "Please enter a valid repository URL.", 
        variant: "destructive" 
      });
      return;
    }
    
    // Basic URL validation
    if (!repoUrl.includes('github.com')) {
      toast({ 
        title: "Invalid URL", 
        description: "Please enter a valid GitHub repository URL.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await generateProjectOverview({ repoUrl });
      setOverview(result.overview);
      setIsOverviewOpen(true);
      setFileTree(mockFileTree); // Load mock data after analysis
      setViewedFiles(new Set()); // Reset progress
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({ 
        title: "Analysis Failed", 
        description: `Unable to analyze the repository: ${errorMessage}. Please verify the URL is accessible and try again.`, 
        variant: "destructive" 
      });
      setFileTree(mockFileTree); // Load mock data even if AI fails, for demo purposes
      setViewedFiles(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = useCallback((file: { path: string, content: string, id: string }) => {
    setSelectedFile({ path: file.path, content: file.content });
    setViewedFiles(prev => new Set(prev).add(file.id));
  }, []);

  const projectStructureString = useMemo(() => JSON.stringify(fileTree, null, 2), [fileTree]);

  return (
    <SidebarProvider>
      <div className="relative min-h-screen w-full bg-background">
        <Sidebar className="sidebar-transition">
          <SidebarContent className="p-0">
             <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Sparkles className="text-primary" />
                    <h2 className="text-lg font-semibold">StudioFlow</h2>
                </div>
            </SidebarHeader>
            {fileTree.length > 0 ? (
              <div className="p-2">
                 <FileTree nodes={fileTree} onFileSelect={handleFileSelect} />
              </div>
            ) : (
                <div className="p-4 text-sm text-muted-foreground">
                    <p>Enter a repository URL to start exploring the codebase.</p>
                </div>
            )}
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <div className="p-4 md:p-6 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-lg font-medium">Codebase Analysis</CardTitle>
                 <div className="flex items-center gap-2">
                   <Settings onSettingsChange={handleSettingsChange} />
                   <SidebarTrigger className="md:hidden"/>
                 </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-grow flex items-center gap-2">
                    <Github className="text-muted-foreground" />
                    <Input
                      placeholder="Enter public GitHub URL..."
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button onClick={handleAnalyzeRepo} disabled={isLoading}>
                    {isLoading ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> Analyze Repository
                      </>
                    )}
                  </Button>
                </div>
                {fileTree.length > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-muted-foreground">Exploration Progress</span>
                            <span className="text-sm font-semibold text-accent-foreground">{viewedFiles.size} / {totalFiles} files</span>
                        </div>
                        <Progress value={progress} className="w-full [&>div]:bg-accent progress-bar" />
                    </div>
                )}
              </CardContent>
            </Card>

            {selectedFile ? (
              <div className="space-y-4">
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
              <div className="flex items-center justify-center text-center p-10 border-2 border-dashed rounded-lg h-96">
                <div>
                  <h3 className="text-xl font-semibold text-muted-foreground">Select a file to begin</h3>
                  <p className="text-muted-foreground mt-2">Choose a file from the navigator on the left to view its content and get AI-powered explanations.</p>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>

        <AlertDialog open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
          <AlertDialogContent className="max-w-2xl modal-transition">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <BookOpen /> Project Overview
              </AlertDialogTitle>
              <AlertDialogDescription>
                Here is a high-level overview of the project&apos;s architecture, key components, and data flow.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4 text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-md">
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
