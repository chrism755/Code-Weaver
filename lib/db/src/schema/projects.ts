import { pgTable, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  language: text("language"),
  userId: text("user_id").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  isPinned: boolean("is_pinned").notNull().default(false),
  subdomain: text("subdomain"),
  forkCount: integer("fork_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({
  createdAt: true,
  updatedAt: true,
  forkCount: true,
  likeCount: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
