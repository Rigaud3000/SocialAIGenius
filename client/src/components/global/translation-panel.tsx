import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Languages, ArrowRightLeft, Copy, Check, Globe, MessageSquare } from "lucide-react";
import { supportedLanguages, translateText, detectLanguage, batchTranslate } from "@/lib/translation";

interface TranslationPanelProps {
  initialText?: string;
  compact?: boolean;
  onTranslated?: (text: string, language: string) => void;
}

export default function TranslationPanel({ initialText = "", compact = false, onTranslated }: TranslationPanelProps) {
  const [sourceText, setSourceText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [autoDetect, setAutoDetect] = useState(true);
  const [activeTab, setActiveTab] = useState("translate");
  
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Missing text",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      let sourceLang = sourceLanguage;
      
      // Auto-detect source language if needed
      if (autoDetect || sourceLanguage === "auto") {
        const detected = await detectLanguage(sourceText);
        setDetectedLanguage(detected);
        sourceLang = detected;
      }
      
      const result = await translateText({
        text: sourceText,
        sourceLanguage: sourceLang,
        targetLanguage,
      });
      
      setTranslatedText(result.translatedText);
      
      // Call the callback if provided
      if (onTranslated) {
        onTranslated(result.translatedText, targetLanguage);
      }
      
      toast({
        title: "Translation complete",
        description: `Successfully translated to ${supportedLanguages.find(l => l.code === targetLanguage)?.name || targetLanguage}`,
      });
    } catch (error) {
      toast({
        title: "Translation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied",
      description: "Translation copied to clipboard",
    });
  };
  
  const handleSwapLanguages = () => {
    if (sourceLanguage !== "auto" && translatedText) {
      setSourceText(translatedText);
      setTargetLanguage(sourceLanguage);
      setSourceLanguage(targetLanguage);
      setTranslatedText("");
    } else {
      toast({
        description: "Cannot swap with auto-detect language",
      });
    }
  };

  return (
    <Card className={compact ? "w-full" : "w-full max-w-4xl mx-auto"}>
      <CardHeader className={compact ? "p-3" : "p-6"}>
        <CardTitle className="flex items-center">
          <Languages className="mr-2 h-5 w-5 text-primary" />
          Translation
        </CardTitle>
        <CardDescription>
          Translate content to reach a global audience
        </CardDescription>
      </CardHeader>
      <CardContent className={compact ? "p-3 pt-0" : "p-6 pt-0"}>
        <Tabs 
          defaultValue="translate" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="translate">Translate Text</TabsTrigger>
            <TabsTrigger value="conversation">Conversations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="translate" className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <div className="flex justify-between items-center mb-2">
                  <Label>Source Language</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-detect"
                      checked={autoDetect}
                      onCheckedChange={setAutoDetect}
                      className="h-4 w-7"
                    />
                    <Label htmlFor="auto-detect" className="text-xs text-gray-500">
                      Auto-detect
                    </Label>
                  </div>
                </div>
                <Select
                  value={sourceLanguage}
                  onValueChange={val => {
                    setSourceLanguage(val);
                    if (val !== "auto") {
                      setAutoDetect(false);
                    }
                  }}
                  disabled={autoDetect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
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
              
              <div className="col-span-12 md:col-span-2 flex items-center justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwapLanguages}
                  disabled={sourceLanguage === "auto" || !translatedText}
                  className="rounded-full"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="col-span-12 md:col-span-5">
                <Label className="mb-2">Target Language</Label>
                <Select
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Original Text</Label>
                <Textarea
                  placeholder="Enter text to translate..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="min-h-[150px]"
                />
                {detectedLanguage && autoDetect && (
                  <div className="flex items-center">
                    <Globe className="h-3 w-3 mr-1 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      Detected: {supportedLanguages.find(l => l.code === detectedLanguage)?.name || detectedLanguage}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Translated Text</span>
                  {translatedText && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  )}
                </Label>
                <Textarea
                  placeholder="Translation will appear here..."
                  value={translatedText}
                  readOnly
                  className="min-h-[150px] bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="conversation" className="space-y-4">
            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <MessageSquare className="h-4 w-4 mr-2" />
              <AlertDescription>
                Enable live translation for conversations in any language. Messages are automatically translated to your preferred language.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Preferred Language</Label>
                <Select
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
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
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border min-h-[200px] flex justify-center items-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Enable this feature in conversations to see translations</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className={compact ? "p-3" : "p-6"}>
        <Button 
          onClick={handleTranslate}
          disabled={!sourceText.trim() || loading || activeTab !== "translate"}
          className="ml-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Languages className="mr-2 h-4 w-4" />
              Translate
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}