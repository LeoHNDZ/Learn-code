'use client';

import { useState } from 'react';
import { GitCompare, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { FileNode } from '@/lib/mock-data';

type CodeComparisonProps = {
  files: FileNode[];
  currentFile?: { path: string; content: string };
};

type ComparisonFile = {
  path: string;
  content: string;
  label: string;
};

export function CodeComparison({ files, currentFile }: CodeComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [leftFile, setLeftFile] = useState<ComparisonFile | null>(null);
  const [rightFile, setRightFile] = useState<ComparisonFile | null>(null);
  const [copiedSide, setCopiedSide] = useState<'left' | 'right' | null>(null);
  const { toast } = useToast();

  // Flatten the file tree to get all files
  const getAllFiles = (nodes: FileNode[], basePath = ''): ComparisonFile[] => {
    const result: ComparisonFile[] = [];
    
    for (const node of nodes) {
      if (node.type === 'file') {
        result.push({
          path: `${basePath}/${node.name}`,
          content: node.content,
          label: `${basePath}/${node.name}`,
        });
      } else {
        result.push(...getAllFiles(node.children, `${basePath}/${node.name}`));
      }
    }
    
    return result;
  };

  const allFiles = getAllFiles(files);
  if (currentFile && !allFiles.find(f => f.path === currentFile.path)) {
    allFiles.unshift({
        path: currentFile.path,
        content: currentFile.content,
        label: currentFile.path
    });
  }


  const handleCopyContent = async (content: string, side: 'left' | 'right') => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSide(side);
      toast({
        title: 'Content Copied',
        description: 'File content has been copied to clipboard.',
      });
      
      // Reset the copy state after 2 seconds
      setTimeout(() => setCopiedSide(null), 2000);
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy content to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const getFileDifferences = () => {
    if (!leftFile || !rightFile) return null;
    
    const leftLines = leftFile.content.split('\n');
    const rightLines = rightFile.content.split('\n');
    const maxLines = Math.max(leftLines.length, rightLines.length);
    
    const differences = [];
    for (let i = 0; i < maxLines; i++) {
      const leftLine = leftLines[i] || '';
      const rightLine = rightLines[i] || '';
      
      if (leftLine !== rightLine) {
        differences.push({
          line: i + 1,
          left: leftLine,
          right: rightLine,
        });
      }
    }
    
    return differences;
  };

  const differences = getFileDifferences();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hover-transition">
          <GitCompare className="h-4 w-4 mr-2" />
          Compare Files
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] modal-transition">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Code Comparison
          </DialogTitle>
          <DialogDescription>
            Compare two files side by side to identify differences and similarities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Left File</label>
              <Select 
                value={leftFile?.path || ''} 
                onValueChange={(value) => {
                  if (value === 'current' && currentFile) {
                     setLeftFile({path: currentFile.path, content: currentFile.content, label: currentFile.path});
                  } else {
                    const file = allFiles.find(f => f.path === value);
                    setLeftFile(file || null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a file..." />
                </SelectTrigger>
                <SelectContent>
                  {currentFile && (
                    <SelectItem value="current">
                      <Badge variant="secondary" className="mr-2">Current</Badge>
                      {currentFile.path}
                    </SelectItem>
                  )}
                  {allFiles.map((file) => (
                    <SelectItem key={file.path} value={file.path}>
                      {file.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Right File</label>
              <Select 
                value={rightFile?.path || ''} 
                onValueChange={(value) => {
                  if (value === 'current' && currentFile) {
                     setRightFile({path: currentFile.path, content: currentFile.content, label: currentFile.path});
                  } else {
                    const file = allFiles.find(f => f.path === value);
                    setRightFile(file || null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a file..." />
                </SelectTrigger>
                <SelectContent>
                  {currentFile && (
                    <SelectItem value="current">
                      <Badge variant="secondary" className="mr-2">Current</Badge>
                      {currentFile.path}
                    </SelectItem>
                  )}
                  {allFiles.map((file) => (
                    <SelectItem key={file.path} value={file.path}>
                      {file.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comparison Results */}
          {leftFile && rightFile && (
            <>
              <Separator />
              
              {/* Statistics */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {differences ? `${differences.length} differences found` : 'Files are identical'}
                </span>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    Left: {leftFile.content.split('\n').length} lines
                  </Badge>
                  <Badge variant="outline">
                    Right: {rightFile.content.split('\n').length} lines
                  </Badge>
                </div>
              </div>

              {/* Side by Side Comparison */}
              <div className="grid grid-cols-2 gap-4 h-[400px]">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm truncate">{leftFile.label}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopyContent(leftFile.content, 'left')}
                        className="h-6 w-6 p-0"
                      >
                        {copiedSide === 'left' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[320px]">
                      <div className="code-viewer p-4 h-full">
                        <pre className="text-xs">
                          <code>{leftFile.content}</code>
                        </pre>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm truncate">{rightFile.label}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopyContent(rightFile.content, 'right')}
                        className="h-6 w-6 p-0"
                      >
                        {copiedSide === 'right' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[320px]">
                      <div className="code-viewer p-4 h-full">
                        <pre className="text-xs">
                          <code>{rightFile.content}</code>
                        </pre>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Differences Summary */}
              {differences && differences.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Differences Summary</CardTitle>
                    <CardDescription>
                      Lines where the files differ from each other.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2 text-xs">
                        {differences.slice(0, 10).map((diff, index) => (
                          <div key={index} className="border rounded p-2 space-y-1">
                            <div className="font-medium text-muted-foreground">
                              Line {diff.line}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-red-50 dark:bg-red-900/20 p-1 rounded text-red-800 dark:text-red-200">
                                -{diff.left || '<empty>'}
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded text-green-800 dark:text-green-200">
                                +{diff.right || '<empty>'}
                              </div>
                            </div>
                          </div>
                        ))}
                        {differences.length > 10 && (
                          <div className="text-muted-foreground text-center">
                            ... and {differences.length - 10} more differences
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

    