import { TranslationRequest, TranslationResponse, BatchTranslationRequest, Language } from '@shared/types';
import { apiRequest } from './queryClient';

// List of supported languages
export const supportedLanguages: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸"
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸"
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷"
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪"
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹"
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇵🇹"
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺"
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳"
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵"
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷"
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦"
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳"
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    flag: "🇧🇩"
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷"
  },
  {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    flag: "🇳🇱"
  },
  {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    flag: "🇵🇱"
  },
  {
    code: "sv",
    name: "Swedish",
    nativeName: "Svenska",
    flag: "🇸🇪"
  },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    flag: "🇺🇦"
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: "🇻🇳"
  },
  {
    code: "th",
    name: "Thai",
    nativeName: "ไทย",
    flag: "🇹🇭"
  }
];

/**
 * Translate text from one language to another
 * Uses Gemini API for translation services via backend
 */
export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  try {
    const response = await apiRequest({
      method: 'POST',
      url: '/api/translate',
      data: request
    });
    
    return response;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to translate text');
  }
}

/**
 * Detect the language of a text
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await apiRequest({
      method: 'POST',
      url: '/api/detect-language',
      data: { text }
    });
    
    return response.languageCode;
  } catch (error) {
    console.error('Language detection error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to detect language');
  }
}

/**
 * Batch translate multiple pieces of content at once
 * Useful for translating entire posts or collections
 */
export async function batchTranslate(
  request: BatchTranslationRequest
): Promise<any> {
  try {
    const response = await apiRequest({
      method: 'POST',
      url: '/api/batch-translate',
      data: request
    });
    
    return response;
  } catch (error) {
    console.error('Batch translation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to batch translate content');
  }
}

/**
 * Get language name from language code
 */
export function getLanguageName(code: string): string {
  const language = supportedLanguages.find(lang => lang.code === code);
  return language ? language.name : code;
}

/**
 * Get language flag emoji from language code
 */
export function getLanguageFlag(code: string): string {
  const language = supportedLanguages.find(lang => lang.code === code);
  return language ? language.flag : '🏳️';
}