import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Language, BatchTranslationRequest } from '@shared/types';
import { supportedLanguages } from '@/lib/translation';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Globe, Copy, Check, Languages, ExternalLink, Code, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface WebsiteTranslatorProps {
  className?: string;
}

export default function WebsiteTranslator({ className }: WebsiteTranslatorProps) {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [htmlContent, setHtmlContent] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState<'url' | 'html'>('url');
  const [translationElements, setTranslationElements] = useState<string[]>([
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a', 'button', 'li'
  ]);
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [copied, setCopied] = useState(false);

  // Website fetching mutation
  const fetchWebsiteMutation = useMutation({
    mutationFn: async (websiteUrl: string) => {
      return await apiRequest({
        method: 'POST',
        url: '/api/fetch-website',
        data: { url: websiteUrl }
      });
    },
    onSuccess: (data) => {
      setHtmlContent(data.content);
      toast({
        title: 'Website fetched successfully',
        description: 'The website content has been loaded for translation',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to fetch website',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Website translation mutation
  const translateWebsiteMutation = useMutation({
    mutationFn: async ({ html, targetLang, elements }: { html: string, targetLang: string, elements: string[] }) => {
      // Extract text content from HTML based on selected elements
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Create a map of elements to translate
      const textsToTranslate: { id: string; text: string }[] = [];
      let idCounter = 0;
      
      elements.forEach(tag => {
        const nodes = doc.querySelectorAll(tag);
        nodes.forEach(node => {
          // Skip if node has no text content or is part of a script/style
          if (!node.textContent?.trim() || 
              node.closest('script') || 
              node.closest('style') || 
              node.getAttribute('data-no-translate') === 'true') {
            return;
          }
          
          // Add a unique identifier to the node
          const uniqueId = `trans-${idCounter++}`;
          node.setAttribute('data-translation-id', uniqueId);
          
          textsToTranslate.push({
            id: uniqueId,
            text: node.textContent.trim()
          });
        });
      });
      
      // Batch translate the texts
      if (textsToTranslate.length === 0) {
        return { html, translatedTexts: [] };
      }
      
      // Update progress as we go
      setProgress(10);
      
      // Split into manageable batches to avoid overwhelming the API
      const batchSize = 20;
      let translatedTexts: { id: string; translatedText: string; originalText: string }[] = [];
      
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        const batch = textsToTranslate.slice(i, i + batchSize);
        
        // Update progress
        const progressValue = Math.min(90, 10 + (i / textsToTranslate.length) * 80);
        setProgress(Math.round(progressValue));
        
        const batchRequest: BatchTranslationRequest = {
          items: batch,
          targetLanguage: targetLang
        };
        
        const batchResponse = await apiRequest<{
          items: { id: string; translatedText: string; originalText: string }[];
        }>({
          method: 'POST',
          url: '/api/batch-translate',
          data: batchRequest
        });
        
        translatedTexts = [...translatedTexts, ...batchResponse.items];
      }
      
      // Replace the original text with translated text in the HTML
      const translatedDoc = parser.parseFromString(html, 'text/html');
      
      translatedTexts.forEach(({ id, translatedText }) => {
        const element = translatedDoc.querySelector(`[data-translation-id="${id}"]`);
        if (element) {
          element.textContent = translatedText;
        }
      });
      
      // Finish progress
      setProgress(100);
      
      return {
        html: translatedDoc.documentElement.outerHTML,
        translatedTexts
      };
    },
    onSuccess: (data) => {
      setTranslatedContent(data.html);
      toast({
        title: 'Website translated successfully',
        description: `Translated ${data.translatedTexts.length} elements into ${getLanguageNameByCode(targetLanguage)}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Translation failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }
  });

  // Handle website fetch
  const handleFetchWebsite = () => {
    if (!url.trim()) {
      setIsUrlValid(false);
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid website URL',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Simple URL validation
      new URL(url);
      setIsUrlValid(true);
      fetchWebsiteMutation.mutate(url);
    } catch (e) {
      setIsUrlValid(false);
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid website URL including http:// or https://',
        variant: 'destructive',
      });
    }
  };

  // Handle website translation
  const handleTranslateWebsite = () => {
    if (tab === 'url' && !htmlContent) {
      toast({
        title: 'No content to translate',
        description: 'Please fetch a website first',
        variant: 'destructive',
      });
      return;
    }
    
    if (tab === 'html' && !htmlContent) {
      toast({
        title: 'No content to translate',
        description: 'Please enter HTML content first',
        variant: 'destructive',
      });
      return;
    }
    
    translateWebsiteMutation.mutate({
      html: htmlContent,
      targetLang: targetLanguage,
      elements: translationElements
    });
  };

  // Toggle translation elements
  const toggleElement = (element: string) => {
    if (translationElements.includes(element)) {
      setTranslationElements(prev => prev.filter(e => e !== element));
    } else {
      setTranslationElements(prev => [...prev, element]);
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'The translated HTML has been copied to your clipboard',
    });
  };

  // Show preview in new window
  const showPreview = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(translatedContent);
      previewWindow.document.close();
    } else {
      toast({
        title: 'Preview blocked',
        description: 'Your browser blocked the preview. Please allow popups for this site.',
        variant: 'destructive',
      });
    }
  };

  // Helper function to get language name by code
  const getLanguageNameByCode = (code: string): string => {
    const language = supportedLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  // Helper to render language flag
  const getLanguageFlag = (code: string): string => {
    const language = supportedLanguages.find(lang => lang.code === code);
    return language ? language.flag : '🏳️';
  };

  // Reset the form
  const handleReset = () => {
    if (tab === 'url') {
      setUrl('');
    }
    setHtmlContent('');
    setTranslatedContent('');
    setProgress(0);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Globe className="h-5 w-5 mr-2 text-primary" />
          Website Translator
        </CardTitle>
        <CardDescription>
          Translate entire websites or HTML content to reach global audiences
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'url' | 'html')} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="url">
              <ExternalLink className="h-4 w-4 mr-2" />
              Website URL
            </TabsTrigger>
            <TabsTrigger value="html">
              <Code className="h-4 w-4 mr-2" />
              HTML Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="website-url">Website URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="website-url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setIsUrlValid(true);
                  }}
                  className={!isUrlValid ? "border-red-500" : ""}
                />
                <Button 
                  onClick={handleFetchWebsite} 
                  disabled={fetchWebsiteMutation.isPending}
                >
                  {fetchWebsiteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  Fetch
                </Button>
              </div>
              {!isUrlValid && (
                <p className="text-xs text-red-500">Please enter a valid URL including http:// or https://</p>
              )}
            </div>

            {htmlContent && (
              <div className="space-y-2">
                <Label>Preview of fetched content:</Label>
                <div className="bg-gray-50 dark:bg-gray-900 border rounded-md p-3 max-h-32 overflow-y-auto text-xs font-mono">
                  {htmlContent.substring(0, 500)}...
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="html-content">HTML Content</Label>
              <Textarea
                id="html-content"
                placeholder="Paste HTML content here to translate..."
                className="font-mono text-xs min-h-[200px]"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="target-language">Target Language</Label>
          <Select
            value={targetLanguage}
            onValueChange={setTargetLanguage}
          >
            <SelectTrigger id="target-language" className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>HTML Elements to Translate</Label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-1">
            {['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a', 'button', 'li'].map((element) => (
              <div key={element} className="flex items-center space-x-2">
                <Checkbox 
                  id={`element-${element}`} 
                  checked={translationElements.includes(element)}
                  onCheckedChange={() => toggleElement(element)}
                />
                <Label 
                  htmlFor={`element-${element}`} 
                  className="text-sm cursor-pointer"
                >
                  &lt;{element}&gt;
                </Label>
              </div>
            ))}
          </div>
        </div>

        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Translation Progress</Label>
              <span className="text-xs text-gray-500">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {translatedContent && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Translated Website Content</Label>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  Copy
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={showPreview}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border rounded-md p-3 max-h-48 overflow-y-auto text-xs font-mono">
              {translatedContent.substring(0, 1000)}...
            </div>
          </div>
        )}

        <Alert className="bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800">
          <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
            Note: Website translation may not be perfect for all sites, especially those with complex JavaScript or dynamic content.
            Some content may not be properly translated due to technical limitations.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={translateWebsiteMutation.isPending || fetchWebsiteMutation.isPending}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button 
          onClick={handleTranslateWebsite} 
          disabled={
            (!htmlContent) || 
            translateWebsiteMutation.isPending || 
            translationElements.length === 0
          }
        >
          {translateWebsiteMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Languages className="h-4 w-4 mr-2" />
          )}
          Translate Website
        </Button>
      </CardFooter>
    </Card>
  );
}