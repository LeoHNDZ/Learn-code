'use client';

import { useState } from 'react';
import { MessageSquare, Save, X, Share, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export type Annotation = {
  id: string;
  lineNumber: number;
  author: string;
  content: string;
  timestamp: number;
  filePath: string;
};

type FileAnnotationsProps = {
  filePath: string;
  onAnnotationAdd?: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
};

export function FileAnnotations({ filePath, onAnnotationAdd }: FileAnnotationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState({
    lineNumber: 1,
    author: '',
    content: '',
  });
  const { toast } = useToast();

  // Load annotations from localStorage
  const loadAnnotations = () => {
    const saved = localStorage.getItem(`annotations-${filePath}`);
    if (saved) {
      try {
        setAnnotations(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load annotations:', error);
      }
    }
  };

  // Save annotations to localStorage
  const saveAnnotations = (annotationsToSave: Annotation[]) => {
    localStorage.setItem(`annotations-${filePath}`, JSON.stringify(annotationsToSave));
  };

  const handleAddAnnotation = () => {
    if (!newAnnotation.content.trim() || !newAnnotation.author.trim()) {
      toast({
        title: 'Incomplete Annotation',
        description: 'Please provide both author name and annotation content.',
        variant: 'destructive',
      });
      return;
    }

    const annotation: Annotation = {
      id: Date.now().toString(),
      ...newAnnotation,
      timestamp: Date.now(),
      filePath,
    };

    const updatedAnnotations = [...annotations, annotation];
    setAnnotations(updatedAnnotations);
    saveAnnotations(updatedAnnotations);
    
    onAnnotationAdd?.({ ...newAnnotation, filePath });
    
    setNewAnnotation({
      lineNumber: 1,
      author: newAnnotation.author, // Keep author name for convenience
      content: '',
    });

    toast({
      title: 'Annotation Added',
      description: 'Your annotation has been saved successfully.',
    });
  };

  const handleDeleteAnnotation = (id: string) => {
    const updatedAnnotations = annotations.filter(a => a.id !== id);
    setAnnotations(updatedAnnotations);
    saveAnnotations(updatedAnnotations);
    
    toast({
      title: 'Annotation Deleted',
      description: 'The annotation has been removed.',
    });
  };

  const handleShareAnnotations = async () => {
    if (annotations.length === 0) {
      toast({
        title: 'No Annotations',
        description: 'There are no annotations to share for this file.',
        variant: 'destructive',
      });
      return;
    }

    const shareData = {
      filePath,
      annotations: annotations.map(a => ({
        line: a.lineNumber,
        author: a.author,
        content: a.content,
        timestamp: new Date(a.timestamp).toISOString(),
      })),
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(shareData, null, 2));
      toast({
        title: 'Annotations Copied',
        description: 'All annotations have been copied to clipboard as JSON.',
      });
    } catch {
      toast({
        title: 'Share Failed',
        description: 'Unable to copy annotations to clipboard.',
        variant: 'destructive',
      });
    }
  };

  // Load annotations when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadAnnotations();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hover-transition">
          <MessageSquare className="h-4 w-4 mr-2" />
          Annotations
          {annotations.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {annotations.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] modal-transition">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            File Annotations
          </DialogTitle>
          <DialogDescription>
            Add and manage annotations for {filePath}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Annotation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add New Annotation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Line Number</label>
                  <Input
                    type="number"
                    min="1"
                    value={newAnnotation.lineNumber}
                    onChange={(e) => setNewAnnotation(prev => ({ 
                      ...prev, 
                      lineNumber: parseInt(e.target.value) || 1 
                    }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Author</label>
                  <Input
                    placeholder="Your name"
                    value={newAnnotation.author}
                    onChange={(e) => setNewAnnotation(prev => ({ 
                      ...prev, 
                      author: e.target.value 
                    }))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Annotation</label>
                <Textarea
                  placeholder="Add your annotation or comment..."
                  value={newAnnotation.content}
                  onChange={(e) => setNewAnnotation(prev => ({ 
                    ...prev, 
                    content: e.target.value 
                  }))}
                  rows={3}
                />
              </div>
              <Button onClick={handleAddAnnotation} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Add Annotation
              </Button>
            </CardContent>
          </Card>

          {/* Existing Annotations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Existing Annotations ({annotations.length})
              </h3>
              {annotations.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleShareAnnotations}>
                  <Share className="h-4 w-4 mr-2" />
                  Share All
                </Button>
              )}
            </div>

            <ScrollArea className="h-60">
              <div className="space-y-3">
                {annotations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No annotations yet. Add your first annotation above.
                  </div>
                ) : (
                  annotations
                    .sort((a, b) => a.lineNumber - b.lineNumber)
                    .map((annotation) => (
                      <Card key={annotation.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                Line {annotation.lineNumber}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                {annotation.author}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAnnotation(annotation.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm whitespace-pre-wrap">
                            {annotation.content}
                          </p>
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(annotation.timestamp).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}