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

// Initialize OpenAI with environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.API_KEY_ENV_VAR || "sk-dummy-key" 
});

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
      const { prompt, type } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
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
      const content = JSON.parse(response.choices[0].message.content || '{"title": "", "content": ""}');
      
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
    } catch (error) {
      console.error("AI content generation error:", error);
      res.status(500).json({ message: "Failed to generate AI content" });
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

  // Register API router with prefix
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
