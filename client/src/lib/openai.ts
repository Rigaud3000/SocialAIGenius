import { apiRequest } from "./queryClient";

// Functions to interact with OpenAI API via our backend

export interface ContentGenerationRequest {
  prompt: string;
  type?: "trend" | "content" | "timing";
  platforms?: string[]; // Specific platforms to optimize for
  audience?: string; // Target audience
  keywords?: string[]; // Keywords to include
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

/**
 * Generate content using AI with enhanced capabilities
 * @param request The content generation request with options
 * @returns The AI-generated suggestion
 */
export async function generateContent(request: ContentGenerationRequest): Promise<AiSuggestion> {
  // Prepare request object with defaults if needed
  const enhancedRequest = {
    ...request,
    type: request.type || "content"
  };
  
  const response = await apiRequest("POST", "/api/ai-content", enhancedRequest);
  return await response.json();
}

/**
 * Mark a suggestion as used
 * @param id The suggestion ID to mark as used
 * @returns The updated suggestion
 */
export async function useSuggestion(id: number): Promise<AiSuggestion> {
  const response = await apiRequest("PUT", `/api/ai-suggestions/${id}/use`);
  return await response.json();
}

/**
 * Generate multiple content variations based on a theme
 * @param theme The base theme or topic
 * @param count Number of variations to generate
 * @param type The type of content
 * @returns Array of content suggestions
 */
export async function generateContentVariations(
  theme: string,
  count: number = 3,
  type: "trend" | "content" | "timing" = "content"
): Promise<AiSuggestion[]> {
  // Generate variations one by one
  const variations: AiSuggestion[] = [];
  
  for (let i = 0; i < count; i++) {
    const variation = await generateContent({
      prompt: `Generate variation ${i+1} for: ${theme}. Make it unique from other variations.`,
      type
    });
    
    variations.push(variation);
  }
  
  return variations;
}

/**
 * Create a post from AI suggestion with enhanced options
 * @param suggestionId The suggestion ID to use
 * @param platforms The platform IDs to post to
 * @param scheduledAt Optional scheduled date/time
 * @param customizations Optional content customizations
 * @returns The created post
 */
export async function createPostFromSuggestion(
  suggestionId: number, 
  platforms: number[], 
  scheduledAt?: string,
  customizations?: {
    addHashtags?: boolean;
    includeEmojis?: boolean;
    contentLength?: 'short' | 'medium' | 'long';
    tone?: 'professional' | 'casual' | 'humorous';
  }
): Promise<any> {
  // First, get the suggestion
  const suggestionRes = await apiRequest("GET", `/api/ai-suggestions/${suggestionId}`);
  const suggestion = await suggestionRes.json();
  
  // Apply customizations if provided
  let content = suggestion.content;
  
  // This would normally call the API to customize, but for demo purposes
  // we'll just add a placeholder comment
  if (customizations) {
    content = `${content}\n\n/* Content customized with: ${JSON.stringify(customizations)} */`;
  }
  
  // Create a new post
  const postData = {
    userId: 1, // For demo purposes
    content: content,
    status: scheduledAt ? "scheduled" : "draft",
    scheduledAt: scheduledAt,
    platforms: platforms,
    aiGenerated: true
  };
  
  const postRes = await apiRequest("POST", "/api/posts", postData);
  const post = await postRes.json();
  
  // Mark suggestion as used
  await useSuggestion(suggestionId);
  
  return post;
}
