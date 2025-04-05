import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { TranslationRequest, Language } from '@shared/types';
import { supportedLanguages, translateText, detectLanguage } from '@/lib/translation';
import { useToast } from '@/hooks/use-toast';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, RotateCw, Copy, Check, Languages, Globe, ArrowRightLeft } from 'lucide-react';

// Translation Panel component
export default function TranslationPanel() {
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [copied, setCopied] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  // Translation mutation
  const translateMutation = useMutation({
    mutationFn: async (request: TranslationRequest) => {
      return await translateText(request);
    },
    onSuccess: (data) => {
      setTranslatedText(data.translatedText);
      if (data.detectedSourceLanguage && sourceLanguage === 'auto') {
        setDetectedLanguage(data.detectedSourceLanguage);
      }
    },
    onError: (error) => {
      toast({
        title: 'Translation failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Detect language mutation
  const detectMutation = useMutation({
    mutationFn: async (text: string) => {
      return await detectLanguage(text);
    },
    onSuccess: (detectedCode) => {
      setDetectedLanguage(detectedCode);
      toast({
        title: 'Language detected',
        description: `Detected language: ${getLanguageNameByCode(detectedCode)}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Language detection failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handle translation
  const handleTranslate = () => {
    if (!sourceText.trim()) {
      toast({
        title: 'Empty text',
        description: 'Please enter some text to translate',
        variant: 'destructive',
      });
      return;
    }

    translateMutation.mutate({
      text: sourceText,
      sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
      targetLanguage,
    });
  };

  // Handle detect language
  const handleDetectLanguage = () => {
    if (!sourceText.trim()) {
      toast({
        title: 'Empty text',
        description: 'Please enter some text to detect its language',
        variant: 'destructive',
      });
      return;
    }

    detectMutation.mutate(sourceText);
  };

  // Copy translated text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'The translated text has been copied to your clipboard',
    });
  };

  // Swap source and target languages
  const swapLanguages = () => {
    if (sourceLanguage !== 'auto' && detectedLanguage !== null) {
      const tempLang = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(tempLang);
      // Also swap the text
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    } else {
      toast({
        title: 'Cannot swap languages',
        description: 'Cannot swap when source language is set to auto-detect',
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Languages className="h-5 w-5 mr-2 text-primary" />
          Translation Tool
        </CardTitle>
        <CardDescription>
          Translate content seamlessly between multiple languages using Google's Gemini AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="source-language" className="text-sm font-medium">From</Label>
            <Select
              value={sourceLanguage}
              onValueChange={setSourceLanguage}
            >
              <SelectTrigger id="source-language" className="w-full mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto Detect</SelectItem>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="mx-2 mt-6"
            onClick={swapLanguages}
            disabled={sourceLanguage === 'auto' || translateMutation.isPending}
            title="Swap languages"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Label htmlFor="target-language" className="text-sm font-medium">To</Label>
            <Select
              value={targetLanguage}
              onValueChange={setTargetLanguage}
            >
              <SelectTrigger id="target-language" className="w-full mt-1">
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
        </div>
        
        {detectedLanguage && sourceLanguage === 'auto' && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Detected language: {getLanguageFlag(detectedLanguage)} {getLanguageNameByCode(detectedLanguage)}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="source-text" className="text-sm font-medium">Source Text</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDetectLanguage} 
                disabled={!sourceText.trim() || detectMutation.isPending}
                className="h-6 text-xs"
              >
                {detectMutation.isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Globe className="h-3 w-3 mr-1" />
                )}
                Detect Language
              </Button>
            </div>
            <Textarea
              id="source-text"
              placeholder="Enter text to translate..."
              className="min-h-[120px] resize-y"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="translated-text" className="text-sm font-medium">Translated Text</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyToClipboard}
                disabled={!translatedText}
                className="h-6 text-xs"
              >
                {copied ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <Copy className="h-3 w-3 mr-1" />
                )}
                Copy
              </Button>
            </div>
            <Textarea
              id="translated-text"
              placeholder="Translation will appear here..."
              className="min-h-[120px] resize-y"
              value={translatedText}
              readOnly
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            setSourceText('');
            setTranslatedText('');
            setDetectedLanguage(null);
          }}
          disabled={translateMutation.isPending}
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button 
          onClick={handleTranslate} 
          disabled={!sourceText.trim() || translateMutation.isPending}
        >
          {translateMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Languages className="h-4 w-4 mr-2" />
          )}
          Translate
        </Button>
      </CardFooter>
    </Card>
  );
}