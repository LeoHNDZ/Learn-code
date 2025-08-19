'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoaderCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { explainCodeBlock } from "@/ai/flows/explain-code-block";
import { FileAnnotations } from "@/components/file-annotations";

type CodeViewProps = {
  filePath: string;
  code: string;
  projectStructure: string;
};

export function CodeView({ filePath, code, projectStructure }: CodeViewProps) {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when file path changes
    setSelectedText(null);
    setExplanation(null);
  }, [filePath]);

  const handleSelection = () => {
    if (isExplaining) return;
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 10) { // Require a minimum length for explanation
      setSelectedText(selection);
    } else {
      setSelectedText(null);
    }
  };

  const handleExplainCode = async () => {
    if (!selectedText) return;

    setIsExplaining(true);
    setExplanation(null);
    try {
      const result = await explainCodeBlock({
        code: selectedText,
        filePath,
        projectStructure,
      });
      setExplanation(result.explanation);
    } catch (error) {
      console.error(error);
      toast({
        title: "Explanation Failed",
        description: "Could not get an explanation for the selected code.",
        variant: "destructive",
      });
    } finally {
      setIsExplaining(false);
      setSelectedText(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{filePath}</CardTitle>
              <CardDescription>Select a block of code to get an explanation.</CardDescription>
            </div>
            <FileAnnotations filePath={filePath} />
          </div>
        </CardHeader>
        <CardContent className="relative">
          {selectedText && (
            <div className="absolute top-0 right-6 z-10">
              <Button size="sm" onClick={handleExplainCode} disabled={isExplaining}>
                <Sparkles className="mr-2 h-4 w-4" />
                Explain Code
              </Button>
            </div>
          )}
          <div className="code-viewer h-[400px]">
            <pre ref={codeRef} onMouseUp={handleSelection} onDoubleClick={handleSelection}>
              <code>{code}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
      
      {(isExplaining || explanation) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-accent" /> Code Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isExplaining ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <LoaderCircle className="animate-spin" />
                <span>Generating explanation...</span>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {explanation}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
