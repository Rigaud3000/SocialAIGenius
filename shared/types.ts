// Shared types for client and server

// AI Content Generation Types
export interface ContentGenerationRequest {
  prompt: string;
  type?: "trend" | "content" | "timing";
  platforms?: string[]; // Specific platforms to optimize for
  audience?: string; // Target audience
  keywords?: string[]; // Keywords to include
  useGemini?: boolean; // Whether to use Google Gemini API instead of OpenAI
}

export interface AiSuggestion {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  used: boolean;
  createdAt: string;
  platforms?: string[]; // Platforms this suggestion is optimized for
  metadata?: {
    sentiment?: string;
    hashtags?: string[];
    callToAction?: string;
    bestTime?: string;
    audienceMatch?: number; // 0-100% match with target audience
  };
}

export interface ContentResponse {
  title: string;
  content: string;
}

// Translation Types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage?: string; // If not provided, auto-detect
  targetLanguage: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
  originalText: string;
}

export interface BatchTranslationRequest {
  items: {
    id: string | number;
    text: string;
  }[];
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface BatchTranslationResponse {
  items: {
    id: string | number;
    translatedText: string;
    originalText: string;
  }[];
  sourceLanguage: string;
  targetLanguage: string;
}

// Posting and Scheduling Types
export interface Post {
  id: number;
  userId: number;
  content: string;
  status: string; // "draft", "scheduled", "published", "failed"
  mediaUrls?: string[];
  scheduledAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  aiGenerated?: boolean;
  platforms?: number[]; // Platform IDs this post will be published to
}

export interface PostPlatform {
  id: number;
  postId: number;
  socialAccountId: number;
  publishStatus: string;
  platformContent?: string | null;
  publishedUrl?: string | null;
  engagementStats?: {
    engagement?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  createdAt: string;
}

// Platform and Account Types
export interface Platform {
  id: number;
  name: string;
  slug: string;
  iconUrl: string;
  color: string;
  active: boolean;
}

export interface SocialAccount {
  id: number;
  userId: number;
  platformId: number;
  accountName: string;
  accountId: string;
  token?: string | null;
  tokenSecret?: string | null;
  connected: boolean;
  stats?: {
    followers?: number;
    following?: number;
    posts?: number;
    engagement?: number;
  };
  createdAt: string;
}

// Virtual World / Web3 Types
export interface VirtualWorld {
  id: number;
  name: string;
  slug: string;
  iconUrl: string;
  description: string;
  active: boolean;
  apiEndpoint?: string;
  contractAddress?: string;
  chainId?: number;
}

export interface VirtualWorldAccount {
  id: number;
  userId: number;
  virtualWorldId: number;
  accountName: string;
  walletAddress?: string;
  avatarUrl?: string;
  connected: boolean;
  stats?: {
    followers?: number;
    assets?: number;
    level?: number;
  };
  createdAt: string;
}

export interface VirtualWorldMessage {
  id: number;
  userId: number;
  virtualWorldId: number;
  virtualWorldAccountId: number;
  recipientId: string;
  message: string;
  status: string;
  sentAt?: string;
  createdAt: string;
}

export interface VirtualWorldPost {
  id: number;
  userId: number;
  virtualWorldId: number;
  virtualWorldAccountId: number;
  content: string;
  mediaUrls?: string[];
  location?: {
    x: number;
    y: number;
    z: number;
    worldName?: string;
  };
  status: string;
  publishedAt?: string;
  createdAt: string;
}

// Analytics Types
export interface Analytics {
  totalFollowers: number;
  engagementRate: string;
  reachGrowth: string;
  topPlatform: {
    name: string;
    followers: number;
    growth: string;
  };
  recentEngagement: {
    date: string;
    value: number;
  }[];
  platformStats: {
    id: number;
    name: string;
    slug: string;
    iconUrl: string;
    color: string;
    followers: number;
    engagement: string;
    growth: string;
    posts: number;
  }[];
}