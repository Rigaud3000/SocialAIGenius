import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  avatarUrl: true,
});

// Social media platforms
export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  iconUrl: text("icon_url").notNull(),
  color: text("color").notNull(),
  active: boolean("active").notNull().default(true),
});

export const insertPlatformSchema = createInsertSchema(platforms).pick({
  name: true,
  slug: true,
  iconUrl: true,
  color: true,
  active: true,
});

// Social accounts
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platformId: integer("platform_id").notNull().references(() => platforms.id),
  accountName: text("account_name").notNull(),
  accountId: text("account_id").notNull(),
  token: text("token"),
  tokenSecret: text("token_secret"),
  connected: boolean("connected").notNull().default(true),
  stats: jsonb("stats"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).pick({
  userId: true,
  platformId: true,
  accountName: true,
  accountId: true,
  token: true,
  tokenSecret: true,
  connected: true,
  stats: true,
});

// Posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls"),
  status: text("status").notNull(), // draft, scheduled, published
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  aiGenerated: boolean("ai_generated").default(false),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  content: true,
  mediaUrls: true,
  status: true,
  scheduledAt: true,
  publishedAt: true,
  aiGenerated: true,
});

// Post Platforms (which post is published to which platforms)
export const postPlatforms = pgTable("post_platforms", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  socialAccountId: integer("social_account_id").notNull().references(() => socialAccounts.id),
  platformContent: text("platform_content"), // Platform-specific modified content
  publishStatus: text("publish_status").notNull(), // pending, published, failed
  publishedUrl: text("published_url"),
  engagementStats: jsonb("engagement_stats"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostPlatformSchema = createInsertSchema(postPlatforms).pick({
  postId: true,
  socialAccountId: true,
  platformContent: true,
  publishStatus: true,
  publishedUrl: true,
  engagementStats: true,
});

// AI Content Suggestions
export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // trend, content, timing
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).pick({
  userId: true,
  title: true,
  content: true,
  type: true,
  used: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platforms.$inferSelect;

export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type SocialAccount = typeof socialAccounts.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertPostPlatform = z.infer<typeof insertPostPlatformSchema>;
export type PostPlatform = typeof postPlatforms.$inferSelect;

export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
