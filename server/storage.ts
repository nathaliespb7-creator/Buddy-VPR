import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  taskContent,
  studentProgress,
  sessionState,
  type TaskContent,
  type InsertTaskContent,
  type StudentProgress,
  type InsertStudentProgress,
  type SessionState,
  type InsertSessionState,
} from "@shared/schema";

export interface IStorage {
  getAllTasks(): Promise<TaskContent[]>;
  getTasksByCategory(category: string): Promise<TaskContent[]>;
  insertTask(task: InsertTaskContent): Promise<TaskContent>;
  getTaskCount(): Promise<number>;

  saveProgress(progress: InsertStudentProgress): Promise<StudentProgress>;
  getSessionProgress(sessionId: string): Promise<StudentProgress[]>;

  getOrCreateSession(sessionId: string): Promise<SessionState>;
  updateSession(sessionId: string, data: Partial<InsertSessionState>): Promise<SessionState | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getAllTasks(): Promise<TaskContent[]> {
    return db.select().from(taskContent);
  }

  async getTasksByCategory(category: string): Promise<TaskContent[]> {
    return db.select().from(taskContent).where(eq(taskContent.category, category));
  }

  async insertTask(task: InsertTaskContent): Promise<TaskContent> {
    const [result] = await db.insert(taskContent).values(task).returning();
    return result;
  }

  async getTaskCount(): Promise<number> {
    const tasks = await db.select().from(taskContent);
    return tasks.length;
  }

  async saveProgress(progress: InsertStudentProgress): Promise<StudentProgress> {
    const [result] = await db.insert(studentProgress).values(progress).returning();
    return result;
  }

  async getSessionProgress(sessionId: string): Promise<StudentProgress[]> {
    return db.select().from(studentProgress).where(eq(studentProgress.sessionId, sessionId));
  }

  async getOrCreateSession(sessionId: string): Promise<SessionState> {
    const existing = await db
      .select()
      .from(sessionState)
      .where(eq(sessionState.sessionId, sessionId));

    if (existing.length > 0) {
      return existing[0];
    }

    const [result] = await db
      .insert(sessionState)
      .values({ sessionId, currentTaskIndex: 0, totalScore: 0, level: "beginner", discoveryCompleted: false })
      .returning();
    return result;
  }

  async updateSession(sessionId: string, data: Partial<InsertSessionState>): Promise<SessionState | undefined> {
    const [result] = await db
      .update(sessionState)
      .set(data)
      .where(eq(sessionState.sessionId, sessionId))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
