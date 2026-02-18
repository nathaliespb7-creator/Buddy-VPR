import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goldenRules = pgTable("golden_rules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  topic: text("topic").notNull(),
  category: text("category").notNull(),
  magicHint: text("magic_hint").notNull(),
  hintsDefault: text("hints_default").notNull(),
  hintsSchoolOfRussia: text("hints_school_of_russia").notNull(),
  hintsZankov: text("hints_zankov").notNull(),
  hintsElkonin: text("hints_elkonin").notNull(),
  vprTask: text("vpr_task").notNull(),
  block: text("block"),
  taskNumber: integer("task_number"),
  algorithm: text("algorithm"),
});

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
  ruleId: integer("rule_id"),
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

export const insertGoldenRuleSchema = createInsertSchema(goldenRules);
export const insertTaskContentSchema = createInsertSchema(taskContent);
export const insertStudentProgressSchema = createInsertSchema(studentProgress);
export const insertSessionStateSchema = createInsertSchema(sessionState);

export type GoldenRule = typeof goldenRules.$inferSelect;
export type InsertGoldenRule = Omit<GoldenRule, "id">;
export type TaskContent = typeof taskContent.$inferSelect;
export type InsertTaskContent = Omit<TaskContent, "id">;
export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = Omit<StudentProgress, "id">;
export type SessionState = typeof sessionState.$inferSelect;
export type InsertSessionState = Omit<SessionState, "id">;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
} as any);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
