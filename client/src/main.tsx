import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create a demo user if not exists
const setupInitialData = async () => {
  try {
    // Check if we have connected accounts
    const accountsResponse = await fetch('/api/accounts');
    const accounts = await accountsResponse.json();
    
    // If no accounts, set up demo data
    if (!accounts || accounts.length === 0) {
      // For demo purposes, we'll create some mock accounts
      const platforms = [
        { platformId: 1, accountName: "YourBrand", accountId: "yourbrand", userId: 1 },
        { platformId: 2, accountName: "YourBrand", accountId: "yourbrand", userId: 1 },
        { platformId: 3, accountName: "YourBrand", accountId: "yourbrand", userId: 1 },
        { platformId: 4, accountName: "YourBrand", accountId: "yourbrand", userId: 1 }
      ];
      
      for (const platform of platforms) {
        await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(platform)
        });
      }
      
      // Create some example posts
      const posts = [
        {
          userId: 1,
          content: "5 ways to improve your social media strategy",
          status: "published",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          platforms: [2]
        },
        {
          userId: 1,
          content: "Team building activities for your remote employees",
          status: "published",
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          platforms: [4]
        },
        {
          userId: 1,
          content: "Announcing our new product features for Q3",
          status: "published",
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          platforms: [1]
        },
        {
          userId: 1,
          content: "10 tips for creating engaging social media content",
          status: "published",
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          platforms: [3]
        },
        {
          userId: 1,
          content: "How to leverage AI in your marketing strategy",
          status: "scheduled",
          scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          platforms: [1, 2, 3]
        }
      ];
      
      for (const post of posts) {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post)
        });
      }
      
      // Create AI suggestions
      const suggestions = [
        {
          userId: 1,
          title: "Trending Topic Alert",
          content: "#SustainableBusiness is trending in your industry. Create content around sustainability practices to boost engagement.",
          type: "trend",
          used: false
        },
        {
          userId: 1,
          title: "Content Suggestion",
          content: "Your audience engages most with video content. Consider creating a short tutorial video about your latest product features.",
          type: "content",
          used: false
        },
        {
          userId: 1,
          title: "Optimal Posting Time",
          content: "Your Instagram audience is most active on Tuesdays at 2PM. Schedule your next post for maximum reach.",
          type: "timing",
          used: false
        }
      ];
      
      for (const suggestion of suggestions) {
        await fetch('/api/ai-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: suggestion.content,
            type: suggestion.type
          })
        });
      }
    }
  } catch (error) {
    console.error("Error setting up initial data:", error);
  }
};

// Set up initial data and then render the app
setupInitialData().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
