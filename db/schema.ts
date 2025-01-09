import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const userLikes = pgTable("user_likes", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// New table for video suggestions
export const videoSuggestions = pgTable("video_suggestions", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const videoRelations = relations(videos, ({ many }) => ({
  likes: many(userLikes)
}));

export const userLikesRelations = relations(userLikes, ({ one }) => ({
  video: one(videos, {
    fields: [userLikes.videoId],
    references: [videos.id],
  })
}));

// Update Zod schemas for input validation
export const insertVideoSchema = createInsertSchema(videos);
export const selectVideoSchema = createSelectSchema(videos);

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
});
export const selectUserSchema = createSelectSchema(users);

export const insertUserLikeSchema = createInsertSchema(userLikes);
export const selectUserLikeSchema = createSelectSchema(userLikes);

// Add schemas for video suggestions
export const insertVideoSuggestionSchema = createInsertSchema(videoSuggestions, {
  url: z.string().url("Please enter a valid video URL"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});
export const selectVideoSuggestionSchema = createSelectSchema(videoSuggestions);