import React from 'react';
import { Helmet } from "react-helmet";
import TranslationPanel from "@/components/global/translation-panel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Languages, Globe } from "lucide-react";

export default function Translation() {
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
            <TranslationPanel />
          </div>
          
          <div className="space-y-6">            
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
          </div>
        </div>
      </div>
    </div>
  );
}