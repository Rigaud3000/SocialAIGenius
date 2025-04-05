import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface to include Google Translate properties
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: {
          new (options: any, elementId: string): any;
          InlineLayout: {
            SIMPLE: string;
          };
        };
      };
    };
  }
}

// Supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
];

// Google Translate script ID
const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script';
// Google Translate element ID
const GOOGLE_TRANSLATE_ELEMENT_ID = 'google-translate-element';

interface LanguageSelectorProps {
  position?: 'fixed' | 'relative';
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ position = 'relative', className = '' }) => {
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslateInitialized, setIsTranslateInitialized] = useState(false);

  // Initialize Google Translate
  useEffect(() => {
    // Check if the script is already loaded
    if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      setIsTranslateInitialized(true);
      return;
    }

    // Create the translate element if it doesn't exist
    if (!document.getElementById(GOOGLE_TRANSLATE_ELEMENT_ID)) {
      const element = document.createElement('div');
      element.id = GOOGLE_TRANSLATE_ELEMENT_ID;
      element.style.display = 'none';
      document.body.appendChild(element);
    }

    // Define the callback for Google Translate
    window.googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        GOOGLE_TRANSLATE_ELEMENT_ID
      );
      setIsTranslateInitialized(true);

      // Hide Google's default widget parts
      const style = document.createElement('style');
      style.textContent = `
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        .goog-te-gadget {
          height: 0 !important;
          overflow: hidden !important;
        }
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf { display: none !important; }
        .VIpgJd-ZVi9od-aZ2wEe-OiiCO { display: none !important; }
        .VIpgJd-ZVi9od-aZ2wEe { display: none !important; }
      `;
      document.head.appendChild(style);
    };

    // Load the Google Translate script
    const script = document.createElement('script');
    script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);

    // Clean up
    return () => {
      // We don't remove the script to avoid issues with multiple mounts/unmounts
    };
  }, []);

  // Function to change the language
  const changeLanguage = (langCode: string) => {
    if (!isTranslateInitialized) {
      toast({
        title: 'Translation not ready',
        description: 'The translation service is still initializing. Please try again in a moment.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Find the language selector from Google Translate
      const langSelector = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (langSelector) {
        // Set the language
        langSelector.value = langCode;
        // Trigger the change event
        langSelector.dispatchEvent(new Event('change'));
        // Update current language state
        setCurrentLanguage(langCode);

        // Show success message
        const langInfo = supportedLanguages.find(l => l.code === langCode);
        toast({
          title: 'Language Changed',
          description: `The page has been translated to ${langInfo?.name || langCode}`,
        });
      } else {
        throw new Error('Language selector not found');
      }
    } catch (error) {
      console.error('Error changing language:', error);
      toast({
        title: 'Translation error',
        description: 'Failed to change the language. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get the current language info
  const currentLangInfo = supportedLanguages.find(l => l.code === currentLanguage) || supportedLanguages[0];

  return (
    <div className={`${position === 'fixed' ? 'fixed top-4 right-4 z-50' : 'relative'} ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 min-w-[110px] justify-between">
            <span className="flex items-center">
              <span className="mr-2">{currentLangInfo.flag}</span>
              {currentLangInfo.name}
            </span>
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
          {supportedLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center ${lang.code === currentLanguage ? 'bg-primary/10 font-medium' : ''}`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden Google Translate Element - will be controlled via JavaScript */}
      <div id={GOOGLE_TRANSLATE_ELEMENT_ID} style={{ display: 'none' }} />
    </div>
  );
};

export default LanguageSelector;