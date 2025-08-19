'use client';

import React, { useState } from 'react';
import { FileText, Folder, FolderOpen } from 'lucide-react';
import type { FileNode } from '@/lib/mock-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FileTreeProps = {
  nodes: FileNode[];
  onFileSelect: (file: { path: string; content: string; id: string }) => void;
  basePath?: string;
};

export function FileTree({ nodes, onFileSelect, basePath = '' }: FileTreeProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const handleFileClick = (file: { path: string; content: string; id: string }) => {
    onFileSelect(file);
    setActiveNode(file.id);
  }

  return (
    <div className="w-full">
      {nodes.map((node) => (
        <div key={node.id}>
          {node.type === 'folder' ? (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={node.name} className="border-b-0">
                <AccordionTrigger className="p-1 rounded-md hover:bg-sidebar-accent [&[data-state=open]>svg:first-child]:hidden [&[data-state=closed]>svg:last-child]:hidden">
                    <div className="flex items-center gap-2 text-sm">
                        <Folder className="h-4 w-4 text-primary" />
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <span>{node.name}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pl-4 border-l border-dashed ml-2">
                  <FileTree nodes={node.children} onFileSelect={onFileSelect} basePath={`${basePath}/${node.name}`} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <Button
              variant="ghost"
              className={cn("w-full justify-start p-1 h-auto font-normal", activeNode === node.id && "bg-sidebar-accent")}
              onClick={() => handleFileClick({ path: `${basePath}/${node.name}`, content: node.content, id: node.id })}
            >
              <div className="flex items-center gap-2 text-sm ml-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{node.name}</span>
              </div>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
