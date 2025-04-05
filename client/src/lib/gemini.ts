import { apiRequest } from "./queryClient";
import { AiSuggestion, ContentGenerationRequest, ContentResponse } from "./openai";

/**
 * Generate content using Google's Gemini API with enhanced capabilities
 * @param request The content generation request with options
 * @returns The AI-generated suggestion
 */
export async function generateContent(request: ContentGenerationRequest): Promise<AiSuggestion> {
  // Prepare request object with defaults if needed
  const enhancedRequest = {
    ...request,
    type: request.type || "content",
    useGemini: true // Flag to indicate using Gemini API instead of OpenAI
  };
  
  try {
    const response = await apiRequest("POST", "/api/ai-content", enhancedRequest);
    
    // Check if there's a problem with the response
    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle rate limiting or quota issues
      if (response.status === 429) {
        throw new Error(`Gemini API quota exceeded: ${errorData.message || 'Please try again later or update your API key.'}`);
      }
      
      throw new Error(errorData.message || "Failed to generate content");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
}

/**
 * Generate multiple content variations based on a theme using Gemini
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