import { ContentGenerationRequest, AiSuggestion, ContentResponse } from "@shared/types";
import { apiRequest } from "./queryClient";

/**
 * Generate content using AI with enhanced capabilities
 * @param request The content generation request with options
 * @returns The AI-generated suggestion
 */
export async function generateContent(request: ContentGenerationRequest): Promise<AiSuggestion> {
  // Make API request to content generation endpoint
  const response = await apiRequest({
    method: "POST",
    url: "/api/ai-content",
    data: request,
  });

  return response;
}

/**
 * Mark a suggestion as used
 * @param id The suggestion ID to mark as used
 * @returns The updated suggestion
 */
export async function useSuggestion(id: number): Promise<AiSuggestion> {
  const response = await apiRequest({
    method: "PUT",
    url: `/api/ai-suggestions/${id}/use`,
  });

  return response;
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
  type: string = "content"
): Promise<ContentResponse[]> {
  // This would be implemented in a real application to generate multiple content variations
  // For now we'll simulate it with a placeholder implementation
  
  const suggestions = await Promise.all(
    Array(count).fill(0).map(async (_, i) => {
      const response = await apiRequest({
        method: "POST",
        url: "/api/ai-content",
        data: {
          prompt: `Create a variation ${i + 1} of content about: ${theme}`,
          type,
        },
      });
      
      return {
        title: `Variation ${i + 1}: ${theme}`,
        content: response.content,
      };
    })
  );
  
  return suggestions;
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
  scheduledAt?: Date,
  customizations?: {
    title?: string;
    content?: string;
    hashtags?: string[];
  }
): Promise<any> {
  const response = await apiRequest({
    method: "POST",
    url: "/api/posts",
    data: {
      suggestionId,
      platforms,
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
      ...customizations,
    },
  });
  
  return response;
}