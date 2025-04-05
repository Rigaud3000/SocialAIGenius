import { 
  User, 
  InsertUser, 
  Platform,
  InsertPlatform,
  SocialAccount,
  InsertSocialAccount,
  Post,
  InsertPost,
  PostPlatform,
  InsertPostPlatform,
  AiSuggestion,
  InsertAiSuggestion
} from "@shared/schema";

// Interface defining all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Platform operations
  getAllPlatforms(): Promise<Platform[]>;
  getPlatform(id: number): Promise<Platform | undefined>;
  getPlatformBySlug(slug: string): Promise<Platform | undefined>;
  createPlatform(platform: InsertPlatform): Promise<Platform>;
  
  // Social account operations
  getSocialAccountsByUserId(userId: number): Promise<SocialAccount[]>;
  getSocialAccount(id: number): Promise<SocialAccount | undefined>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: number, stats: any): Promise<SocialAccount | undefined>;
  disconnectSocialAccount(id: number): Promise<boolean>;
  
  // Post operations
  getAllPosts(userId: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, data: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getScheduledPosts(userId: number): Promise<Post[]>;
  
  // Post platform operations
  getPostPlatformsByPostId(postId: number): Promise<PostPlatform[]>;
  createPostPlatform(postPlatform: InsertPostPlatform): Promise<PostPlatform>;
  updatePostPlatformStatus(id: number, status: string, url?: string): Promise<PostPlatform | undefined>;
  updatePostPlatformStats(id: number, stats: any): Promise<PostPlatform | undefined>;
  
  // AI Suggestion operations
  getAiSuggestionsByUserId(userId: number): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  markAiSuggestionAsUsed(id: number): Promise<AiSuggestion | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private platforms: Map<number, Platform>;
  private socialAccounts: Map<number, SocialAccount>;
  private posts: Map<number, Post>;
  private postPlatforms: Map<number, PostPlatform>;
  private aiSuggestions: Map<number, AiSuggestion>;
  
  private userId: number;
  private platformId: number;
  private socialAccountId: number;
  private postId: number;
  private postPlatformId: number;
  private aiSuggestionId: number;
  
  constructor() {
    this.users = new Map();
    this.platforms = new Map();
    this.socialAccounts = new Map();
    this.posts = new Map();
    this.postPlatforms = new Map();
    this.aiSuggestions = new Map();
    
    this.userId = 1;
    this.platformId = 1;
    this.socialAccountId = 1;
    this.postId = 1;
    this.postPlatformId = 1;
    this.aiSuggestionId = 1;
    
    // Initialize with some default platforms
    this.initDefaultPlatforms();
  }
  
  // Initialize default platforms
  private initDefaultPlatforms() {
    const defaultPlatforms: InsertPlatform[] = [
      // Traditional social media platforms
      { name: "Facebook", slug: "facebook", iconUrl: "facebook", color: "#1877F2", active: true },
      { name: "Twitter", slug: "twitter", iconUrl: "twitter", color: "#1DA1F2", active: true },
      { name: "Instagram", slug: "instagram", iconUrl: "instagram", color: "#E1306C", active: true },
      { name: "LinkedIn", slug: "linkedin", iconUrl: "linkedin", color: "#0A66C2", active: true },
      { name: "YouTube", slug: "youtube", iconUrl: "youtube", color: "#FF0000", active: true },
      { name: "Pinterest", slug: "pinterest", iconUrl: "pinterest", color: "#E60023", active: true },
      { name: "TikTok", slug: "tiktok", iconUrl: "tiktok", color: "#000000", active: true },
      { name: "Discord", slug: "discord", iconUrl: "discord", color: "#5865F2", active: true },
      
      // Virtual world and metaverse platforms
      { name: "Decentraland", slug: "decentraland", iconUrl: "decentraland", color: "#FF2D55", active: true },
      { name: "The Sandbox", slug: "sandbox", iconUrl: "sandbox", color: "#00ADEF", active: true },
      { name: "Roblox", slug: "roblox", iconUrl: "roblox", color: "#FF0000", active: true },
      { name: "Meta Horizon Worlds", slug: "meta", iconUrl: "meta", color: "#0080FF", active: true },
      { name: "Voxels", slug: "voxels", iconUrl: "voxels", color: "#9B59B6", active: true },
      { name: "Somnium Space", slug: "somnium", iconUrl: "somnium", color: "#00BCD4", active: true }
    ];
    
    for (const platform of defaultPlatforms) {
      this.createPlatform(platform);
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Platform operations
  async getAllPlatforms(): Promise<Platform[]> {
    return Array.from(this.platforms.values());
  }
  
  async getPlatform(id: number): Promise<Platform | undefined> {
    return this.platforms.get(id);
  }
  
  async getPlatformBySlug(slug: string): Promise<Platform | undefined> {
    return Array.from(this.platforms.values()).find(
      (platform) => platform.slug === slug
    );
  }
  
  async createPlatform(insertPlatform: InsertPlatform): Promise<Platform> {
    const id = this.platformId++;
    const platform: Platform = { ...insertPlatform, id };
    this.platforms.set(id, platform);
    return platform;
  }
  
  // Social account operations
  async getSocialAccountsByUserId(userId: number): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values()).filter(
      (account) => account.userId === userId
    );
  }
  
  async getSocialAccount(id: number): Promise<SocialAccount | undefined> {
    return this.socialAccounts.get(id);
  }
  
  async createSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const id = this.socialAccountId++;
    const now = new Date();
    const account: SocialAccount = { ...insertAccount, id, createdAt: now };
    this.socialAccounts.set(id, account);
    return account;
  }
  
  async updateSocialAccount(id: number, stats: any): Promise<SocialAccount | undefined> {
    const account = this.socialAccounts.get(id);
    if (!account) return undefined;
    
    const updated: SocialAccount = { ...account, stats };
    this.socialAccounts.set(id, updated);
    return updated;
  }
  
  async disconnectSocialAccount(id: number): Promise<boolean> {
    const account = this.socialAccounts.get(id);
    if (!account) return false;
    
    const updated: SocialAccount = { ...account, connected: false };
    this.socialAccounts.set(id, updated);
    return true;
  }
  
  // Post operations
  async getAllPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postId++;
    const now = new Date();
    const post: Post = { ...insertPost, id, createdAt: now };
    this.posts.set(id, post);
    return post;
  }
  
  async updatePost(id: number, data: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updated: Post = { ...post, ...data };
    this.posts.set(id, updated);
    return updated;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
  
  async getScheduledPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId && post.status === 'scheduled')
      .sort((a, b) => {
        if (!a.scheduledAt || !b.scheduledAt) return 0;
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      });
  }
  
  // Post platform operations
  async getPostPlatformsByPostId(postId: number): Promise<PostPlatform[]> {
    return Array.from(this.postPlatforms.values()).filter(
      (pp) => pp.postId === postId
    );
  }
  
  async createPostPlatform(insertPostPlatform: InsertPostPlatform): Promise<PostPlatform> {
    const id = this.postPlatformId++;
    const now = new Date();
    const postPlatform: PostPlatform = { ...insertPostPlatform, id, createdAt: now };
    this.postPlatforms.set(id, postPlatform);
    return postPlatform;
  }
  
  async updatePostPlatformStatus(id: number, status: string, url?: string): Promise<PostPlatform | undefined> {
    const pp = this.postPlatforms.get(id);
    if (!pp) return undefined;
    
    const updated: PostPlatform = { 
      ...pp, 
      publishStatus: status,
      ...(url && { publishedUrl: url })
    };
    this.postPlatforms.set(id, updated);
    return updated;
  }
  
  async updatePostPlatformStats(id: number, stats: any): Promise<PostPlatform | undefined> {
    const pp = this.postPlatforms.get(id);
    if (!pp) return undefined;
    
    const updated: PostPlatform = { ...pp, engagementStats: stats };
    this.postPlatforms.set(id, updated);
    return updated;
  }
  
  // AI Suggestion operations
  async getAiSuggestionsByUserId(userId: number): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values())
      .filter(suggestion => suggestion.userId === userId)
      .sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
  
  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.aiSuggestionId++;
    const now = new Date();
    const suggestion: AiSuggestion = { ...insertSuggestion, id, createdAt: now };
    this.aiSuggestions.set(id, suggestion);
    return suggestion;
  }
  
  async markAiSuggestionAsUsed(id: number): Promise<AiSuggestion | undefined> {
    const suggestion = this.aiSuggestions.get(id);
    if (!suggestion) return undefined;
    
    const updated: AiSuggestion = { ...suggestion, used: true };
    this.aiSuggestions.set(id, updated);
    return updated;
  }
}

// Create and export a single instance of storage
export const storage = new MemStorage();
