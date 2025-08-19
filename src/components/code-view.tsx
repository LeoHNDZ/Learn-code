'use client';

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle, Sparkles, FileText, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { explainCodeBlock } from "@/ai/flows/explain-code-block";
import { generateFileSummary, type FileSummaryOutput } from "@/ai/flows/file-summary";
import { generateCodeSuggestions, type CodeSuggestionsOutput } from "@/ai/flows/code-suggestions";
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
  
  // New AI features state
  const [fileSummary, setFileSummary] = useState<FileSummaryOutput | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [codeSuggestions, setCodeSuggestions] = useState<CodeSuggestionsOutput | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  
  const codeRef = useRef<HTMLPreElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when file path changes
    setSelectedText(null);
    setExplanation(null);
    setFileSummary(null);
    setCodeSuggestions(null);
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
        description: error instanceof Error ? error.message : "Could not get an explanation for the selected code.",
        variant: "destructive",
      });
    } finally {
      setIsExplaining(false);
      setSelectedText(null);
    }
  };

  const handleGenerateFileSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const fileName = filePath.split('/').pop() || filePath;
      const result = await generateFileSummary({
        fileName,
        filePath,
        fileContent: code,
        projectContext: projectStructure,
      });
      setFileSummary(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Summary Failed",
        description: error instanceof Error ? error.message : "Could not generate file summary.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateCodeSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      const language = filePath.split('.').pop() || 'unknown';
      const result = await generateCodeSuggestions({
        code: selectedText || code,
        filePath,
        language,
        context: fileSummary?.purpose,
      });
      setCodeSuggestions(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Suggestions Failed",
        description: error instanceof Error ? error.message : "Could not generate code suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{filePath}</CardTitle>
              <CardDescription>Select code to explain, or use AI features to analyze the entire file.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateFileSummary}
                disabled={isGeneratingSummary}
              >
                {isGeneratingSummary ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                File Summary
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateCodeSuggestions}
                disabled={isGeneratingSuggestions}
              >
                {isGeneratingSuggestions ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lightbulb className="mr-2 h-4 w-4" />
                )}
                Suggestions
              </Button>
              <FileAnnotations filePath={filePath} />
            </div>
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

      {/* AI-powered analysis tabs */}
      {(fileSummary || codeSuggestions || explanation) && (
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="explanation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="explanation" disabled={!explanation && !isExplaining}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Explanation
                </TabsTrigger>
                <TabsTrigger value="summary" disabled={!fileSummary && !isGeneratingSummary}>
                  <FileText className="mr-2 h-4 w-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="suggestions" disabled={!codeSuggestions && !isGeneratingSuggestions}>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explanation" className="p-6">
                {isExplaining ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LoaderCircle className="animate-spin" />
                    <span>Generating explanation...</span>
                  </div>
                ) : explanation ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {explanation}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select some code and click &quot;Explain Code&quot; to get an explanation.</p>
                )}
              </TabsContent>

              <TabsContent value="summary" className="p-6">
                {isGeneratingSummary ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LoaderCircle className="animate-spin" />
                    <span>Generating file summary...</span>
                  </div>
                ) : fileSummary ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p>{fileSummary.summary}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Purpose</h3>
                      <p>{fileSummary.purpose}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm font-medium">Complexity: </span>
                        <Badge className={getComplexityColor(fileSummary.complexity)}>
                          {fileSummary.complexity}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {fileSummary.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Key Components</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {fileSummary.keyComponents.map((component, index) => (
                          <li key={index} className="text-sm">{component}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Click &quot;File Summary&quot; to get an AI-powered analysis of this file.</p>
                )}
              </TabsContent>

              <TabsContent value="suggestions" className="p-6">
                {isGeneratingSuggestions ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LoaderCircle className="animate-spin" />
                    <span>Analyzing code for suggestions...</span>
                  </div>
                ) : codeSuggestions ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Code Analysis</h3>
                      <Badge variant={
                        codeSuggestions.overallQuality === 'excellent' ? 'default' :
                        codeSuggestions.overallQuality === 'good' ? 'secondary' :
                        codeSuggestions.overallQuality === 'fair' ? 'secondary' : 'destructive'
                      }>
                        {codeSuggestions.overallQuality}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">{codeSuggestions.summary}</p>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Suggestions</h4>
                      {codeSuggestions.suggestions.map((suggestion, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {getPriorityIcon(suggestion.priority)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-medium">{suggestion.title}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.type}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {suggestion.description}
                                </p>
                                {suggestion.example && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Example:</p>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                      <code>{suggestion.example}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Click &quot;Suggestions&quot; to get AI-powered improvement recommendations.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
