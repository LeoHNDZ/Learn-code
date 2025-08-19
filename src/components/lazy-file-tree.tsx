'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { FileText, Folder, FolderOpen } from 'lucide-react';
import type { FileNode } from '@/lib/mock-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LazyFileTreeProps = {
  nodes: FileNode[];
  onFileSelect: (file: { path: string; content: string; id: string }) => void;
  basePath?: string;
  maxInitialItems?: number;
  enableKeyboardNavigation?: boolean;
};

type LazyFileNodeProps = {
  node: FileNode;
  onFileSelect: (file: { path: string; content: string; id: string }) => void;
  basePath: string;
  activeNodeId: string | null;
  setActiveNodeId: (id: string | null) => void;
  enableKeyboardNavigation: boolean;
};

function LazyFileNode({ 
  node, 
  onFileSelect, 
  basePath, 
  activeNodeId, 
  setActiveNodeId, 
  enableKeyboardNavigation 
}: LazyFileNodeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleFileClick = useCallback((file: { path: string; content: string; id: string }) => {
    onFileSelect(file);
    setActiveNodeId(file.id);
  }, [onFileSelect, setActiveNodeId]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enableKeyboardNavigation) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (node.type === 'file') {
        handleFileClick({ 
          path: `${basePath}/${node.name}`, 
          content: node.content, 
          id: node.id 
        });
      }
    }
  }, [enableKeyboardNavigation, node, basePath, handleFileClick]);

  // Lazy load folder contents when expanded
  const handleFolderToggle = useCallback(() => {
    if (node.type === 'folder' && !isLoaded) {
      setIsLoaded(true);
    }
  }, [node.type, isLoaded]);

  if (node.type === 'folder') {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={node.name} className="border-b-0">
          <AccordionTrigger 
            className="p-1 rounded-md hover:bg-sidebar-accent hover-transition [&[data-state=open]>svg:first-child]:hidden [&[data-state=closed]>svg:last-child]:hidden"
            onClick={handleFolderToggle}
            onKeyDown={handleKeyDown}
            tabIndex={enableKeyboardNavigation ? 0 : -1}
            role={enableKeyboardNavigation ? "button" : undefined}
            aria-label={enableKeyboardNavigation ? `Expand ${node.name} folder` : undefined}
          >
            <div className="flex items-center gap-2 text-sm">
              <Folder className="h-4 w-4 text-primary" />
              <FolderOpen className="h-4 w-4 text-primary" />
              <span>{node.name}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-4 border-l border-dashed ml-2">
            {isLoaded && (
              <LazyFileTree 
                nodes={node.children} 
                onFileSelect={onFileSelect} 
                basePath={`${basePath}/${node.name}`}
                enableKeyboardNavigation={enableKeyboardNavigation}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start p-1 h-auto font-normal hover-transition", 
        activeNodeId === node.id && "bg-sidebar-accent"
      )}
      onClick={() => handleFileClick({ path: `${basePath}/${node.name}`, content: node.content, id: node.id })}
      onKeyDown={handleKeyDown}
      tabIndex={enableKeyboardNavigation ? 0 : -1}
      role={enableKeyboardNavigation ? "button" : undefined}
      aria-label={enableKeyboardNavigation ? `Open ${node.name} file` : undefined}
    >
      <div className="flex items-center gap-2 text-sm ml-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span>{node.name}</span>
      </div>
    </Button>
  );
}

export function LazyFileTree({ 
  nodes, 
  onFileSelect, 
  basePath = '', 
  maxInitialItems = 10,
  enableKeyboardNavigation = true 
}: LazyFileTreeProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);

  // Determine which items to show initially
  const { visibleNodes, hasMore } = useMemo(() => {
    const shouldLimitItems = nodes.length > maxInitialItems && !showAllItems;
    return {
      visibleNodes: shouldLimitItems ? nodes.slice(0, maxInitialItems) : nodes,
      hasMore: shouldLimitItems
    };
  }, [nodes, maxInitialItems, showAllItems]);

  const handleShowMore = useCallback(() => {
    setShowAllItems(true);
  }, []);

  const handleKeyDownShowMore = useCallback((event: React.KeyboardEvent) => {
    if (!enableKeyboardNavigation) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleShowMore();
    }
  }, [enableKeyboardNavigation, handleShowMore]);

  return (
    <div className="w-full">
      {visibleNodes.map((node) => (
        <div key={node.id}>
          <LazyFileNode
            node={node}
            onFileSelect={onFileSelect}
            basePath={basePath}
            activeNodeId={activeNodeId}
            setActiveNodeId={setActiveNodeId}
            enableKeyboardNavigation={enableKeyboardNavigation}
          />
        </div>
      ))}
      
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-muted-foreground hover-transition"
          onClick={handleShowMore}
          onKeyDown={handleKeyDownShowMore}
          tabIndex={enableKeyboardNavigation ? 0 : -1}
          role={enableKeyboardNavigation ? "button" : undefined}
          aria-label={enableKeyboardNavigation ? `Show ${nodes.length - maxInitialItems} more items` : undefined}
        >
          Show {nodes.length - maxInitialItems} more items...
        </Button>
      )}
    </div>
  );
}