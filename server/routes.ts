import express, { Router, Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertPlatformSchema, 
  insertSocialAccountSchema,
  insertPostSchema,
  insertPostPlatformSchema,
  insertAiSuggestionSchema
} from "@shared/schema";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize OpenAI with environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.API_KEY_ENV_VAR || "sk-dummy-key" 
});

// Initialize Google Gemini API
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyC5T2TPQoUcyZa992JcffC3OMxYXgkXwus");

// Helper to check if the OpenAI API key is valid and has quota
async function checkOpenAIApiKeyStatus(): Promise<{ valid: boolean; message?: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { valid: false, message: "OpenAI API key is not configured" };
    }
    
    // Make a small test request to verify the API key works
    await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 5
    });
    
    return { valid: true };
  } catch (error: any) {
    console.error("OpenAI API key validation error:", error);
    
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      return { 
        valid: false, 
        message: "OpenAI API quota exceeded. Please check your API key billing details or try again later."
      };
    }
    
    if (error?.status === 401) {
      return { 
        valid: false, 
        message: "Invalid OpenAI API key. Please check your API key and try again."
      };
    }
    
    return { 
      valid: false, 
      message: `Error validating OpenAI API key: ${error?.message || "Unknown error"}`
    };
  }
}

// Helper to check if the Gemini API key is valid
async function checkGeminiApiKeyStatus(): Promise<{ valid: boolean; message?: string }> {
  try {
    // If Gemini API key is not set, return false
    if (!process.env.GEMINI_API_KEY && !gemini) {
      return { valid: false, message: "Gemini API key is not configured" };
    }
    
    // Get a generative model
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Send a test prompt
    const result = await model.generateContent("test");
    const response = await result.response;
    
    if (!response) {
      return { valid: false, message: "Failed to get response from Gemini API" };
    }
    
    return { valid: true };
  } catch (error: any) {
    console.error("Gemini API key validation error:", error);
    
    // Handle rate limits
    if (error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
      return { 
        valid: false, 
        message: "Gemini API quota exceeded or rate limited. Please try again later."
      };
    }
    
    // Handle authentication errors
    if (error?.message?.includes('API key')) {
      return { 
        valid: false, 
        message: "Invalid Gemini API key. Please check your API key and try again."
      };
    }
    
    return { 
      valid: false, 
      message: `Error validating Gemini API key: ${error?.message || "Unknown error"}`
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API router for all endpoints
  const apiRouter = Router();
  
  // Get all platforms
  apiRouter.get("/platforms", async (req: Request, res: Response) => {
    try {
      const platforms = await storage.getAllPlatforms();
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platforms" });
    }
  });
  
  // Get all social accounts for a user
  apiRouter.get("/accounts", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use user ID 1
      const userId = 1;
      const accounts = await storage.getSocialAccountsByUserId(userId);
      
      // Get platform details for each account
      const accountsWithPlatforms = await Promise.all(
        accounts.map(async (account) => {
          const platform = await storage.getPlatform(account.platformId);
          return { ...account, platform };
        })
      );
      
      res.json(accountsWithPlatforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social accounts" });
    }
  });
  
  // Connect a new social account
  apiRouter.post("/accounts", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSocialAccountSchema.parse(req.body);
      
      // Create a mock social account
      const stats = {
        followers: Math.floor(Math.random() * 100000),
        engagement: (Math.random() * 10).toFixed(1) + "%",
        growth: (Math.random() * 5).toFixed(1) + "%",
        posts: Math.floor(Math.random() * 1000)
      };
      
      const account = await storage.createSocialAccount({
        ...validatedData,
        stats
      });
      
      const platform = await storage.getPlatform(account.platformId);
      
      res.status(201).json({ ...account, platform });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid account data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to connect account" });
      }
    }
  });
  
  // Get all posts for a user
  apiRouter.get("/posts", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use user ID 1
      const userId = 1;
      const posts = await storage.getAllPosts(userId);
      
      // Get platforms for each post
      const postsWithPlatforms = await Promise.all(
        posts.map(async (post) => {
          const postPlatforms = await storage.getPostPlatformsByPostId(post.id);
          
          const platforms = await Promise.all(
            postPlatforms.map(async (pp) => {
              const account = await storage.getSocialAccount(pp.socialAccountId);
              if (!account) return null;
              
              const platform = await storage.getPlatform(account.platformId);
              return {
                ...pp,
                platform,
                accountName: account.accountName
              };
            })
          );
          
          return {
            ...post,
            platforms: platforms.filter(Boolean)
          };
        })
      );
      
      res.json(postsWithPlatforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  // Create a new post
  apiRouter.post("/posts", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      
      // If platforms are specified, create post platforms
      if (req.body.platforms && Array.isArray(req.body.platforms)) {
        await Promise.all(
          req.body.platforms.map(async (platformId: number) => {
            // Get a social account for this platform
            const accounts = await storage.getSocialAccountsByUserId(post.userId);
            const account = accounts.find(a => a.platformId === platformId);
            
            if (account) {
              await storage.createPostPlatform({
                postId: post.id,
                socialAccountId: account.id,
                platformContent: post.content,
                publishStatus: post.status === 'scheduled' ? 'pending' : 'published',
                publishedUrl: post.status === 'published' ? `https://example.com/post/${post.id}` : undefined,
                engagementStats: post.status === 'published' ? { likes: 0, comments: 0, shares: 0 } : undefined
              });
            }
          })
        );
      }
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create post" });
      }
    }
  });
  
  // Get scheduled posts for a user
  apiRouter.get("/scheduled-posts", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use user ID 1
      const userId = 1;
      const scheduledPosts = await storage.getScheduledPosts(userId);
      
      const postsWithPlatforms = await Promise.all(
        scheduledPosts.map(async (post) => {
          const postPlatforms = await storage.getPostPlatformsByPostId(post.id);
          
          const platforms = await Promise.all(
            postPlatforms.map(async (pp) => {
              const account = await storage.getSocialAccount(pp.socialAccountId);
              if (!account) return null;
              
              const platform = await storage.getPlatform(account.platformId);
              return {
                ...pp,
                platform,
                accountName: account.accountName
              };
            })
          );
          
          return {
            ...post,
            platforms: platforms.filter(Boolean)
          };
        })
      );
      
      res.json(postsWithPlatforms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scheduled posts" });
    }
  });
  
  // Get AI suggestions for a user
  apiRouter.get("/ai-suggestions", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use user ID 1
      const userId = 1;
      const suggestions = await storage.getAiSuggestionsByUserId(userId);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI suggestions" });
    }
  });
  
  // Create new AI content
  apiRouter.post("/ai-content", async (req: Request, res: Response) => {
    try {
      const { prompt, type, useGemini } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      // Determine which API to use
      const useGeminiApi = useGemini === true;
      
      if (useGeminiApi) {
        // Check Gemini API key status
        const apiStatus = await checkGeminiApiKeyStatus();
        if (!apiStatus.valid) {
          return res.status(429).json({
            message: apiStatus.message || "Gemini API key is invalid or has exceeded its quota",
            error: "API_KEY_ERROR",
            provider: "gemini"
          });
        }
      } else {
        // Check OpenAI API key status
        const apiStatus = await checkOpenAIApiKeyStatus();
        if (!apiStatus.valid) {
          return res.status(429).json({
            message: apiStatus.message || "OpenAI API key is invalid or has exceeded its quota",
            error: "API_KEY_ERROR",
            provider: "openai"
          });
        }
      }
      
      // Configure system message based on content type
      let systemMessage = "";
      
      switch (type) {
        case "trend":
          systemMessage = "You are a trend analysis expert for social media. Identify current trends related to the user's prompt and suggest viral content ideas that capitalize on these trends. Provide an engaging title and detailed content that would perform well on social platforms. Respond in JSON format with title and content fields.";
          break;
        case "timing":
          systemMessage = "You are a social media scheduling expert. Analyze the optimal posting times and frequency for content related to the user's prompt. Consider platform-specific timing strategies and audience engagement patterns. Provide recommendations in JSON format with title and content fields.";
          break;
        default:
          systemMessage = "You are a professional social media content creator specializing in viral, engaging posts. Create content that's optimized for high engagement, shares, and conversions. Make it concise yet impactful, with compelling hooks and calls to action. Tailor your suggestions to perform well across multiple platforms. Respond in JSON format with title and content fields.";
      }
      
      // Enhance the prompt based on the content type
      let enhancedPrompt = prompt;
      if (type === "trend") {
        enhancedPrompt = `${prompt}\n\nCreate content that capitalizes on current trends and is likely to go viral. Include relevant hashtags and hooks that will drive engagement.`;
      } else if (type === "timing") {
        enhancedPrompt = `${prompt}\n\nProvide strategic advice on when to post this content for maximum reach and engagement. Include platform-specific recommendations.`;
      }
      
      let content;
      
      try {
        if (useGeminiApi) {
          // Use Google's Gemini API
          const model = gemini.getGenerativeModel({ model: "gemini-1.5-pro" });
          
          // Build the prompt with system message first
          const fullPrompt = `${systemMessage}\n\n${enhancedPrompt}\n\nPlease format your response as a JSON object with "title" and "content" fields.`;
          
          const result = await model.generateContent(fullPrompt);
          const response = await result.response;
          const text = response.text();
          
          // Extract JSON from the response
          // First try to parse the entire text as JSON
          try {
            content = JSON.parse(text);
          } catch (e) {
            // If that fails, try to extract JSON from the response using regex
            const jsonMatch = text.match(/({[\s\S]*})/);
            if (jsonMatch && jsonMatch[1]) {
              try {
                content = JSON.parse(jsonMatch[1]);
              } catch (e2) {
                // If all parsing attempts fail, create a structured response
                content = {
                  title: "Generated Content",
                  content: text
                };
              }
            } else {
              // Create a fallback structure if JSON not found
              content = {
                title: "Generated Content",
                content: text
              };
            }
          }
          
        } else {
          // Use OpenAI API
          // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: systemMessage
              },
              {
                role: "user",
                content: enhancedPrompt
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7 // Add some creativity but keep it focused
          });
          
          // Parse the JSON response
          content = JSON.parse(response.choices[0].message.content || '{"title": "", "content": ""}');
        }
      } catch (error: any) {
        console.error(`${useGeminiApi ? 'Gemini' : 'OpenAI'} API error:`, error);
        
        // Check if it's a rate limit or quota error
        if (error?.code === 'insufficient_quota' || error?.status === 429 || 
            error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
          return res.status(429).json({
            message: `${useGeminiApi ? 'Gemini' : 'OpenAI'} API quota exceeded. Please check your API key billing details or try again later.`,
            error: "QUOTA_EXCEEDED",
            provider: useGeminiApi ? "gemini" : "openai",
            suggestion: "Your API key has reached its usage limit. Consider upgrading your plan or waiting until your quota resets."
          });
        }
        
        // For other errors
        throw error;
      }
      
      // For demo purposes, use user ID 1
      const userId = 1;
      
      // Generate a better title if none provided
      const title = content.title || (type === "trend" ? 
        "Trending Content Opportunity" : 
        type === "timing" ? 
        "Optimal Posting Strategy" : 
        "AI-Optimized Content");
      
      // Save to storage
      const suggestion = await storage.createAiSuggestion({
        userId,
        title: title,
        content: content.content || "",
        type: type || "content",
        used: false
      });
      
      res.json(suggestion);
    } catch (error: any) {
      console.error("AI content generation error:", error);
      
      // If it's an API-related error, provide a clearer message
      if (error?.response?.status === 429 || error?.message?.includes('quota')) {
        return res.status(429).json({
          message: `AI API quota exceeded. Please check your API key billing details or try again later.`,
          error: "QUOTA_EXCEEDED"
        });
      }
      
      res.status(500).json({ 
        message: "Failed to generate AI content",
        error: error?.message || "Unknown error"
      });
    }
  });
  
  // Use AI suggestion (mark as used)
  apiRouter.put("/ai-suggestions/:id/use", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid suggestion ID" });
      }
      
      const updatedSuggestion = await storage.markAiSuggestionAsUsed(id);
      if (!updatedSuggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      res.json(updatedSuggestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to use suggestion" });
    }
  });
  
  // Get analytics data
  apiRouter.get("/analytics", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use user ID 1
      const userId = 1;
      const accounts = await storage.getSocialAccountsByUserId(userId);
      
      const analytics = {
        totalFollowers: 0,
        engagementRate: 0,
        publishedPosts: 0,
        scheduledPosts: 0,
        platforms: []
      };
      
      // Calculate totals
      let totalEngagement = 0;
      
      for (const account of accounts) {
        const platform = await storage.getPlatform(account.platformId);
        
        if (account.stats) {
          const followers = account.stats.followers || 0;
          const engagement = parseFloat((account.stats.engagement || "0%").replace("%", ""));
          const growth = parseFloat((account.stats.growth || "0%").replace("%", ""));
          const posts = account.stats.posts || 0;
          
          analytics.totalFollowers += followers;
          totalEngagement += engagement;
          analytics.publishedPosts += posts;
          
          analytics.platforms.push({
            id: platform?.id,
            name: platform?.name,
            slug: platform?.slug,
            iconUrl: platform?.iconUrl,
            color: platform?.color,
            followers,
            engagement: engagement + "%",
            growth: growth + "%",
            posts
          });
        }
      }
      
      // Calculate average engagement
      analytics.engagementRate = (totalEngagement / (accounts.length || 1)).toFixed(1) + "%";
      
      // Get count of scheduled posts
      const scheduledPosts = await storage.getScheduledPosts(userId);
      analytics.scheduledPosts = scheduledPosts.length;
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // API endpoint to check OpenAI API key status
  apiRouter.get("/ai-api-status", async (req: Request, res: Response) => {
    try {
      // Check if we should use Gemini based on query parameter
      const useGemini = req.query.provider === "gemini" || req.query.useGemini === "true";
      
      if (useGemini) {
        const status = await checkGeminiApiKeyStatus();
        if (status.valid) {
          res.json({ 
            status: "success", 
            message: "Google Gemini API key is valid and operational",
            provider: "gemini"
          });
        } else {
          res.status(400).json({
            status: "error",
            message: status.message,
            provider: "gemini"
          });
        }
      } else {
        const status = await checkOpenAIApiKeyStatus();
        if (status.valid) {
          res.json({ 
            status: "success", 
            message: "OpenAI API key is valid and has sufficient quota",
            provider: "openai"
          });
        } else {
          res.status(400).json({
            status: "error",
            message: status.message,
            provider: "openai"
          });
        }
      }
    } catch (error: any) {
      const isGeminiRequest = req.query.provider === "gemini" || req.query.useGemini === "true";
      res.status(500).json({ 
        status: "error", 
        message: error?.message || `Failed to check ${isGeminiRequest ? 'Gemini' : 'OpenAI'} API status`,
        provider: isGeminiRequest ? "gemini" : "openai"
      });
    }
  });

  // Register API router with prefix
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
