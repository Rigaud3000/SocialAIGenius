import { apiRequest } from "./queryClient";

// Functions to interact with OpenAI API via our backend

export interface ContentGenerationRequest {
  prompt: string;
  type?: "trend" | "content" | "timing";
}

export interface AiSuggestion {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  used: boolean;
  createdAt: string;
}

export interface ContentResponse {
  title: string;
  content: string;
}

// Generate content using AI
export async function generateContent(request: ContentGenerationRequest): Promise<AiSuggestion> {
  const response = await apiRequest("POST", "/api/ai-content", request);
  return await response.json();
}

// Mark a suggestion as used
export async function useSuggestion(id: number): Promise<AiSuggestion> {
  const response = await apiRequest("PUT", `/api/ai-suggestions/${id}/use`);
  return await response.json();
}

// Create a post from AI suggestion
export async function createPostFromSuggestion(
  suggestionId: number, 
  platforms: number[], 
  scheduledAt?: string
): Promise<any> {
  // First, get the suggestion
  const suggestionRes = await apiRequest("GET", `/api/ai-suggestions/${suggestionId}`);
  const suggestion = await suggestionRes.json();
  
  // Create a new post
  const postData = {
    userId: 1, // For demo purposes
    content: suggestion.content,
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
