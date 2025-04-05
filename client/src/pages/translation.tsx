import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import TranslationPanel from "@/components/global/translation-panel";
import WebsiteTranslator from "@/components/global/website-translator";
import TranslationWidget from "@/components/global/translation-widget";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Languages, Globe, Globe2, Code, Puzzle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Translation() {
  const [translationTab, setTranslationTab] = useState<string>("widget");
  
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 lg:p-6 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
      <Helmet>
        <title>Translation Tool - Cross-Cultural Communication</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Translation Hub</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Translate your content across multiple languages to reach a global audience
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={translationTab} onValueChange={setTranslationTab} className="w-full">
              <TabsList className="mb-4 w-full grid grid-cols-3">
                <TabsTrigger value="widget" className="flex items-center">
                  <Puzzle className="h-4 w-4 mr-2" />
                  Translation Widget
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center">
                  <Languages className="h-4 w-4 mr-2" />
                  Text Translation
                </TabsTrigger>
                <TabsTrigger value="website" className="flex items-center">
                  <Globe2 className="h-4 w-4 mr-2" />
                  Website Translation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="widget">
                <TranslationWidget />
              </TabsContent>
              
              <TabsContent value="text">
                <TranslationPanel />
              </TabsContent>
              
              <TabsContent value="website">
                <WebsiteTranslator />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            {translationTab === "widget" && (
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Puzzle className="mr-2 h-5 w-5 text-primary" />
                    Website Translation Widget
                  </CardTitle>
                  <CardDescription>
                    One-click solution for multilingual websites
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-primary">Easy Integration</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add the widget to any website with a single line of code - no technical skills required!
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-primary">100+ Languages</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Instantly translate your website content into over 100 languages using Google's translation engine.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-primary">Customizable Design</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Match the widget to your brand with customizable colors, positions, and language options.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Languages className="mr-2 h-5 w-5 text-primary" />
                  Translation Tips
                </CardTitle>
                <CardDescription>
                  Best practices for effective translations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Cultural Context</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Consider cultural nuances when translating content for different regions.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Keep It Simple</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use clear, straightforward language that's easier to translate accurately.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Review Translations</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Always have a native speaker review your translated content if possible.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-primary" />
                  Global Reach
                </CardTitle>
                <CardDescription>
                  Benefits of multilingual content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-primary">73%</span> of consumers prefer products with information in their native language.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Content in local languages can increase conversion rates by up to <span className="font-medium text-primary">70%</span>.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Multilingual social media posts receive <span className="font-medium text-primary">50%</span> more engagement on average.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {translationTab === "website" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="mr-2 h-5 w-5 text-primary" />
                    Website Translation Usage
                  </CardTitle>
                  <CardDescription>
                    How to use the website translator
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">URL Translation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enter a website URL to fetch and translate its content. Best for static websites.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">HTML Translation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Paste HTML code directly for more control over what gets translated.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Element Selection</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose which HTML elements should be translated to optimize for your specific site structure.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}