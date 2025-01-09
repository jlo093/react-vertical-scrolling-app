import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { videos, insertVideoSchema, userLikes, videoSuggestions } from "@db/schema";
import { eq, and, sql, isNull } from "drizzle-orm";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Set up authentication routes
  setupAuth(app);

  // Direct video submission endpoint
  app.post("/api/videos", async (req, res) => {
    try {
      // Validate request body against schema
      const validatedData = insertVideoSchema.parse(req.body);

      // Insert video into database
      const result = await db.insert(videos)
        .values({
          url: validatedData.url,
          title: validatedData.title,
          description: validatedData.description || "",
          views: 0,
          likes: 0
        })
        .returning();

      res.json(result[0]);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Video suggestion endpoint
  app.post("/api/video-suggestions", async (req, res) => {
    try {
      const suggestion = await db.insert(videoSuggestions)
        .values({
          url: req.body.url,
          title: req.body.title,
          description: req.body.description,
          userId: req.user?.id, // Optional: link to user if authenticated
          status: "pending"
        })
        .returning();

      res.json(suggestion[0]);
    } catch (error) {
      console.error('Error creating video suggestion:', error);
      res.status(500).json({ message: "Failed to create video suggestion" });
    }
  });

  // Get random video
  app.get("/api/videos/random", async (req, res) => {
    const allVideos = await db.query.videos.findMany({
      orderBy: () => sql`RANDOM()`,
      limit: 1
    });
    res.json(allVideos[0]);
  });

  // Get next videos for infinite scroll with optional category filter
  app.get("/api/videos", async (req, res) => {
    try {
      const { cursor, category } = req.query;
      const limit = Number(req.query.limit) || 5;

      const conditions = [];

      if (cursor) {
        conditions.push(sql`videos.id > ${Number(cursor)}`);
      }

      if (category) {
        conditions.push(
          and(
            eq(videos.category, category as string),
            sql`category IS NOT NULL`
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const nextVideos = await db.query.videos.findMany({
        where: whereClause,
        limit,
        orderBy: sql`RANDOM()`,
      });

      res.json(nextVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Increment view count
  app.post("/api/videos/:id/view", async (req, res) => {
    const { id } = req.params;
    await db.update(videos)
      .set({ views: sql`views + 1` })
      .where(eq(videos.id, Number(id)));
    res.json({ success: true });
  });

  // Toggle like
  app.post("/api/videos/:id/like", async (req, res) => {
    const { id } = req.params;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    try {
      const existingLike = await db.query.userLikes.findFirst({
        where: and(
          eq(userLikes.videoId, Number(id)),
          eq(userLikes.sessionId, sessionId)
        )
      });

      if (existingLike) {
        await db.delete(userLikes)
          .where(eq(userLikes.id, existingLike.id));
        await db.update(videos)
          .set({ likes: sql`likes - 1` })
          .where(eq(videos.id, Number(id)));
      } else {
        await db.insert(userLikes)
          .values({ videoId: Number(id), sessionId });
        await db.update(videos)
          .set({ likes: sql`likes + 1` })
          .where(eq(videos.id, Number(id)));
      }

      const updatedVideo = await db.query.videos.findFirst({
        where: eq(videos.id, Number(id))
      });

      res.json({ success: true, likes: updatedVideo?.likes });
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({ message: "Failed to update like status" });
    }
  });

  return httpServer;
}