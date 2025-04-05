import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Code, Copy, Check, Languages, ExternalLink, Settings } from 'lucide-react';
import { supportedLanguages } from '@/lib/translation';
import { useToast } from '@/hooks/use-toast';

interface TranslationWidgetProps {
  className?: string;
}

export default function TranslationWidget({ className }: TranslationWidgetProps) {
  const { toast } = useToast();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [widgetPosition, setWidgetPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  const [scriptCode, setScriptCode] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [displayLanguages, setDisplayLanguages] = useState<string[]>(['en', 'es', 'fr', 'zh', 'ja', 'de', 'ar', 'ru', 'pt']);
  const [customTheme, setCustomTheme] = useState('#3b82f6');
  const [showFlags, setShowFlags] = useState(true);
  const [expandOnHover, setExpandOnHover] = useState(true);
  const [autoDetect, setAutoDetect] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'generator' | 'preview' | 'advanced'>('generator');
  
  // Available positions
  const positions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ];

  // Generate the script code when settings change
  useEffect(() => {
    const selectedLanguages = displayLanguages.map(code => `"${code}"`).join(', ');
    
    const scriptCode = `<!-- Begin Translation Widget Code -->
<script>
(function() {
  // Create a widget container
  var widgetContainer = document.createElement('div');
  widgetContainer.id = 'smart-translate-widget';
  widgetContainer.style.position = 'fixed';
  widgetContainer.style.zIndex = '9999';
  ${widgetPosition === 'top-left' ? 
    'widgetContainer.style.top = "20px"; widgetContainer.style.left = "20px";' : 
    widgetPosition === 'top-right' ? 
    'widgetContainer.style.top = "20px"; widgetContainer.style.right = "20px";' :
    widgetPosition === 'bottom-left' ? 
    'widgetContainer.style.bottom = "20px"; widgetContainer.style.left = "20px";' :
    'widgetContainer.style.bottom = "20px"; widgetContainer.style.right = "20px";'
  }
  widgetContainer.style.display = 'flex';
  widgetContainer.style.flexDirection = 'column';
  widgetContainer.style.alignItems = ${widgetPosition.includes('right') ? '"flex-end"' : '"flex-start"'};
  widgetContainer.style.transition = 'all 0.3s ease';
  
  // Create the main button
  var mainButton = document.createElement('div');
  mainButton.id = 'translate-main-button';
  mainButton.style.width = '50px';
  mainButton.style.height = '50px';
  mainButton.style.borderRadius = '25px';
  mainButton.style.backgroundColor = '${customTheme}';
  mainButton.style.display = 'flex';
  mainButton.style.justifyContent = 'center';
  mainButton.style.alignItems = 'center';
  mainButton.style.cursor = 'pointer';
  mainButton.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  mainButton.style.marginBottom = '10px';
  
  // Add globe icon
  var globeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  globeIcon.setAttribute('viewBox', '0 0 24 24');
  globeIcon.setAttribute('width', '24');
  globeIcon.setAttribute('height', '24');
  globeIcon.setAttribute('fill', 'none');
  globeIcon.setAttribute('stroke', 'white');
  globeIcon.setAttribute('stroke-width', '2');
  globeIcon.setAttribute('stroke-linecap', 'round');
  globeIcon.setAttribute('stroke-linejoin', 'round');
  
  var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '10');
  
  var line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.setAttribute('x1', '2');
  line1.setAttribute('y1', '12');
  line1.setAttribute('x2', '22');
  line1.setAttribute('y2', '12');
  
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z');
  
  globeIcon.appendChild(circle);
  globeIcon.appendChild(line1);
  globeIcon.appendChild(path);
  mainButton.appendChild(globeIcon);
  
  // Create language option container
  var optionsContainer = document.createElement('div');
  optionsContainer.id = 'translate-options';
  optionsContainer.style.display = 'none';
  optionsContainer.style.flexDirection = 'column';
  optionsContainer.style.backgroundColor = 'white';
  optionsContainer.style.borderRadius = '12px';
  optionsContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  optionsContainer.style.overflow = 'hidden';
  optionsContainer.style.marginBottom = '10px';
  
  // Supported languages
  var languages = [${selectedLanguages}];
  var languageNames = {
    'en': { name: 'English', flag: '🇺🇸' },
    'es': { name: 'Español', flag: '🇪🇸' },
    'fr': { name: 'Français', flag: '🇫🇷' },
    'de': { name: 'Deutsch', flag: '🇩🇪' },
    'it': { name: 'Italiano', flag: '🇮🇹' },
    'pt': { name: 'Português', flag: '🇵🇹' },
    'ru': { name: 'Русский', flag: '🇷🇺' },
    'zh': { name: '中文', flag: '🇨🇳' },
    'ja': { name: '日本語', flag: '🇯🇵' },
    'ko': { name: '한국어', flag: '🇰🇷' },
    'ar': { name: 'العربية', flag: '🇸🇦' },
    'hi': { name: 'हिन्दी', flag: '🇮🇳' },
    'bn': { name: 'বাংলা', flag: '🇧🇩' },
    'tr': { name: 'Türkçe', flag: '🇹🇷' },
    'nl': { name: 'Nederlands', flag: '🇳🇱' },
    'vi': { name: 'Tiếng Việt', flag: '🇻🇳' },
    'th': { name: 'ไทย', flag: '🇹🇭' }
  };
  
  // Add language options
  languages.forEach(function(langCode) {
    var languageInfo = languageNames[langCode] || { name: langCode, flag: '🏳️' };
    
    var langOption = document.createElement('div');
    langOption.className = 'translate-language-option';
    langOption.dataset.language = langCode;
    langOption.style.padding = '10px 20px';
    langOption.style.cursor = 'pointer';
    langOption.style.display = 'flex';
    langOption.style.alignItems = 'center';
    langOption.style.transition = 'background-color 0.2s';
    langOption.style.color = '#333';
    langOption.style.fontSize = '14px';
    
    // Add hover effect
    langOption.onmouseover = function() {
      this.style.backgroundColor = '#f3f4f6';
    };
    langOption.onmouseout = function() {
      this.style.backgroundColor = 'transparent';
    };
    
    // Add flag if enabled
    if (${showFlags}) {
      var flagSpan = document.createElement('span');
      flagSpan.style.marginRight = '8px';
      flagSpan.style.fontSize = '16px';
      flagSpan.textContent = languageInfo.flag;
      langOption.appendChild(flagSpan);
    }
    
    var nameSpan = document.createElement('span');
    nameSpan.textContent = languageInfo.name;
    langOption.appendChild(nameSpan);
    
    // Add click event
    langOption.onclick = function() {
      translatePage(langCode);
      optionsContainer.style.display = 'none';
      isExpanded = false;
    };
    
    optionsContainer.appendChild(langOption);
    
    // Add separator except for last item
    if (languages.indexOf(langCode) < languages.length - 1) {
      var separator = document.createElement('div');
      separator.style.height = '1px';
      separator.style.backgroundColor = '#f3f4f6';
      optionsContainer.appendChild(separator);
    }
  });
  
  // Toggle expand/collapse
  var isExpanded = false;
  mainButton.onclick = function() {
    isExpanded = !isExpanded;
    optionsContainer.style.display = isExpanded ? 'flex' : 'none';
  };
  
  // Hover expand if enabled
  if (${expandOnHover}) {
    mainButton.onmouseover = function() {
      optionsContainer.style.display = 'flex';
      isExpanded = true;
    };
    
    widgetContainer.onmouseleave = function() {
      optionsContainer.style.display = 'none';
      isExpanded = false;
    };
  }
  
  // Add widget elements to container
  widgetContainer.appendChild(optionsContainer);
  widgetContainer.appendChild(mainButton);
  
  // Translation function
  function translatePage(targetLang) {
    // Check if Google Translate is already loaded
    if (!window.googleTranslateElementInit) {
      // Add Google Translate script
      var translateScript = document.createElement('script');
      translateScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      
      // Create the translate element
      var translateElement = document.createElement('div');
      translateElement.id = 'google_translate_element';
      translateElement.style.display = 'none';
      document.body.appendChild(translateElement);
      
      // Initialize the translate function
      window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
          pageLanguage: '${defaultLanguage}',
          autoDisplay: false,
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
        
        // Set the target language
        var langSelect = document.querySelector('.goog-te-combo');
        if (langSelect) {
          langSelect.value = targetLang;
          langSelect.dispatchEvent(new Event('change'));
        }
      };
      
      document.head.appendChild(translateScript);
    } else {
      // Use the existing Google Translate element
      var langSelect = document.querySelector('.goog-te-combo');
      if (langSelect) {
        langSelect.value = targetLang;
        langSelect.dispatchEvent(new Event('change'));
      }
    }
  }
  
  // Auto-detect browser language
  if (${autoDetect}) {
    var browserLang = navigator.language || navigator.userLanguage;
    browserLang = browserLang.split('-')[0]; // Get the primary language code
    
    // Check if browser language is in our supported list
    if (languages.includes(browserLang) && browserLang !== '${defaultLanguage}') {
      // Create a small notification
      var notification = document.createElement('div');
      notification.style.position = 'fixed';
      notification.style.bottom = '80px';
      notification.style.right = '20px';
      notification.style.backgroundColor = '${customTheme}';
      notification.style.color = 'white';
      notification.style.padding = '10px 15px';
      notification.style.borderRadius = '8px';
      notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
      notification.style.fontSize = '14px';
      notification.style.zIndex = '10000';
      notification.style.cursor = 'pointer';
      
      var langInfo = languageNames[browserLang] || { name: browserLang, flag: '🏳️' };
      notification.textContent = ${showFlags} ? langInfo.flag + ' Translate to ' + langInfo.name + '?' : 'Translate to ' + langInfo.name + '?';
      
      notification.onclick = function() {
        translatePage(browserLang);
        document.body.removeChild(notification);
      };
      
      // Add close button
      var closeBtn = document.createElement('span');
      closeBtn.textContent = '✕';
      closeBtn.style.marginLeft = '10px';
      closeBtn.style.fontWeight = 'bold';
      closeBtn.onclick = function(e) {
        e.stopPropagation();
        document.body.removeChild(notification);
      };
      notification.appendChild(closeBtn);
      
      // Auto-hide after 7 seconds
      setTimeout(function() {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 7000);
      
      document.body.appendChild(notification);
    }
  }
  
  // Add the widget to the page
  document.body.appendChild(widgetContainer);
  
  // Add custom styles to fix Google Translate elements
  var style = document.createElement('style');
  style.textContent = \`
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
  \`;
  document.head.appendChild(style);
})();
</script>
<!-- End Translation Widget Code -->`;

    setScriptCode(scriptCode);
  }, [widgetPosition, displayLanguages, customTheme, showFlags, expandOnHover, autoDetect, defaultLanguage]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Widget code copied!',
      description: 'The code has been copied to your clipboard.',
    });
  };

  const handleLanguageToggle = (language: string) => {
    if (displayLanguages.includes(language)) {
      // Don't allow removing the last language or the default language
      if (displayLanguages.length <= 1 || language === defaultLanguage) {
        return;
      }
      setDisplayLanguages(displayLanguages.filter(l => l !== language));
    } else {
      setDisplayLanguages([...displayLanguages, language]);
    }
  };

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      setTab('preview');
    } else {
      setTab('generator');
    }
  };

  // Update default language
  const handleDefaultLanguageChange = (language: string) => {
    setDefaultLanguage(language);
    // Make sure the default language is in the display languages
    if (!displayLanguages.includes(language)) {
      setDisplayLanguages([...displayLanguages, language]);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Globe className="h-5 w-5 mr-2 text-primary" />
          Website Translation Widget Generator
        </CardTitle>
        <CardDescription>
          Create a customizable translation widget that can be added to any website
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'generator' | 'preview' | 'advanced')} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="generator">
              <Code className="h-4 w-4 mr-2" />
              Widget Generator
            </TabsTrigger>
            <TabsTrigger value="preview">
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="h-4 w-4 mr-2" />
              Advanced Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website-url">Your Website URL (optional)</Label>
              <Input
                id="website-url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Used for preview purposes only. The widget will work on any website.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="widget-position">Widget Position</Label>
              <Select
                value={widgetPosition}
                onValueChange={(value) => setWidgetPosition(value as any)}
              >
                <SelectTrigger id="widget-position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-language">Default Language</Label>
              <Select
                value={defaultLanguage}
                onValueChange={handleDefaultLanguageChange}
              >
                <SelectTrigger id="default-language">
                  <SelectValue placeholder="Select default language" />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                This is the original language of your website
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="widget-theme">Widget Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="widget-theme"
                  type="color"
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  type="text"
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  className="flex-1"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-flags"
                  checked={showFlags}
                  onCheckedChange={setShowFlags}
                />
                <Label htmlFor="show-flags">Show Language Flags</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="expand-hover"
                  checked={expandOnHover}
                  onCheckedChange={setExpandOnHover}
                />
                <Label htmlFor="expand-hover">Expand on Hover</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-detect"
                  checked={autoDetect}
                  onCheckedChange={setAutoDetect}
                />
                <Label htmlFor="auto-detect">Auto-detect Visitor Language</Label>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label>Widget Code</Label>
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
                  Copy Code
                </Button>
              </div>
              <Textarea
                value={scriptCode}
                readOnly
                className="font-mono text-xs min-h-[200px]"
              />
              <p className="text-xs text-gray-500">
                Copy and paste this code right before the closing &lt;/body&gt; tag of your website.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Widget Preview</Label>
                {websiteUrl ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open(`https://translate.google.com/translate?sl=auto&tl=es&u=${encodeURIComponent(websiteUrl)}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    See on Google Translate
                  </Button>
                ) : null}
              </div>
              
              <div className="border rounded-md overflow-hidden relative min-h-[400px] bg-gray-50">
                {!websiteUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center flex-col p-4 text-center">
                    <Globe className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500">Enter a website URL above to see a preview</p>
                    <p className="text-xs text-gray-400 mt-2">Or click the button below to see a demo of the widget</p>
                  </div>
                ) : (
                  <iframe 
                    src={websiteUrl}
                    className="w-full h-[400px] border-none"
                    title="Website Preview"
                  />
                )}
                
                {/* Widget preview overlay */}
                <div 
                  className={`absolute ${
                    widgetPosition === 'top-left' ? 'top-4 left-4' : 
                    widgetPosition === 'top-right' ? 'top-4 right-4' : 
                    widgetPosition === 'bottom-left' ? 'bottom-4 left-4' : 
                    'bottom-4 right-4'
                  } z-10`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: customTheme }}>
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                This is a simulated preview of how the widget will appear on your website. The actual functionality will be fully working when embedded on your site.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label>Languages to Display</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-1">
                {supportedLanguages.map((lang) => (
                  <div key={lang.code} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`lang-${lang.code}`} 
                      checked={displayLanguages.includes(lang.code)}
                      disabled={lang.code === defaultLanguage || (displayLanguages.length <= 1 && displayLanguages.includes(lang.code))}
                      onCheckedChange={() => handleLanguageToggle(lang.code)}
                    />
                    <Label 
                      htmlFor={`lang-${lang.code}`} 
                      className="text-sm cursor-pointer flex items-center"
                    >
                      <span className="mr-1">{lang.flag}</span> {lang.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Select which languages will be available in your translation widget. The default language is always included.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={togglePreview}
        >
          {showPreview ? (
            <>
              <Code className="h-4 w-4 mr-2" />
              Back to Generator
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview Widget
            </>
          )}
        </Button>
        <Button 
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          Copy Widget Code
        </Button>
      </CardFooter>
    </Card>
  );
}