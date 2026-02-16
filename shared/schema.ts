import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const taskContent = pgTable("task_content", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: text("type").notNull(),
  word: text("word").notNull(),
  question: text("question"),
  correct: text("correct").notNull(),
  options: text("options").array(),
  audio: text("audio").notNull(),
  hint: text("hint").notNull(),
  rule: text("rule"),
  difficulty: integer("difficulty").notNull().default(1),
  category: text("category").notNull().default("general"),
});

export const studentProgress = pgTable("student_progress", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: text("session_id").notNull(),
  taskId: integer("task_id").notNull(),
  attempts: integer("attempts").notNull().default(0),
  hintsUsed: integer("hints_used").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  correct: boolean("correct").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

export const sessionState = pgTable("session_state", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: text("session_id").notNull().unique(),
  currentTaskIndex: integer("current_task_index").notNull().default(0),
  totalScore: integer("total_score").notNull().default(0),
  level: text("level").notNull().default("beginner"),
  discoveryCompleted: boolean("discovery_completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskContentSchema = createInsertSchema(taskContent).omit({ id: true });
export const insertStudentProgressSchema = createInsertSchema(studentProgress).omit({ id: true });
export const insertSessionStateSchema = createInsertSchema(sessionState).omit({ id: true });

export type TaskContent = typeof taskContent.$inferSelect;
export type InsertTaskContent = z.infer<typeof insertTaskContentSchema>;
export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;
export type SessionState = typeof sessionState.$inferSelect;
export type InsertSessionState = z.infer<typeof insertSessionStateSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
