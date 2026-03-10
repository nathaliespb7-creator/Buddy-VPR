import { eq, and, sql } from "drizzle-orm";
import { db } from "./db";
import {
  goldenRules,
  taskContent,
  studentProgress,
  sessionState,
  categoryRounds,
  roundTaskResults,
  type GoldenRule,
  type InsertGoldenRule,
  type TaskContent,
  type InsertTaskContent,
  type StudentProgress,
  type InsertStudentProgress,
  type SessionState,
  type InsertSessionState,
  type CategoryRound,
  type RoundTaskResult,
} from "@shared/schema";

export interface IStorage {
  getAllRules(): Promise<GoldenRule[]>;
  getRulesByCategory(category: string): Promise<GoldenRule[]>;
  insertRule(rule: InsertGoldenRule): Promise<GoldenRule>;
  getRuleCount(): Promise<number>;
  clearRules(): Promise<void>;

  getAllTasks(): Promise<TaskContent[]>;
  getTasksByCategory(category: string): Promise<TaskContent[]>;
  insertTask(task: InsertTaskContent): Promise<TaskContent>;
  getTaskCount(): Promise<number>;
  clearTasks(): Promise<void>;

  saveProgress(progress: InsertStudentProgress): Promise<StudentProgress>;
  getSessionProgress(sessionId: string): Promise<StudentProgress[]>;

  getOrCreateSession(sessionId: string): Promise<SessionState>;
  updateSession(sessionId: string, data: Partial<InsertSessionState>): Promise<SessionState | undefined>;

  getActiveRound(sessionId: string, category: string): Promise<CategoryRound | null>;
  createRound(sessionId: string, category: string, roundNumber: number, taskIds: number[]): Promise<CategoryRound>;
  getRoundTasks(roundId: number): Promise<RoundTaskResult[]>;
  submitAnswer(roundId: number, taskId: number, correctFirstAttempt: boolean, attempts: number): Promise<boolean>;
  advanceRoundIndex(roundId: number): Promise<void>;
  completeRound(roundId: number): Promise<CategoryRound>;
  getCategorySummary(sessionId: string, category: string): Promise<{ rounds: CategoryRound[], allResults: RoundTaskResult[] }>;
  getAllCategorySummaries(sessionId: string): Promise<{ category: string, roundNumber: number, status: string, totalTasks: number, correctCount: number, wrongCount: number, currentIndex: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getAllRules(): Promise<GoldenRule[]> {
    return db.select().from(goldenRules);
  }

  async getRulesByCategory(category: string): Promise<GoldenRule[]> {
    return db.select().from(goldenRules).where(eq(goldenRules.category, category));
  }

  async insertRule(rule: InsertGoldenRule): Promise<GoldenRule> {
    const [result] = await db.insert(goldenRules).values(rule).returning();
    return result;
  }

  async getRuleCount(): Promise<number> {
    const rules = await db.select().from(goldenRules);
    return rules.length;
  }

  async clearRules(): Promise<void> {
    await db.delete(goldenRules);
  }

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

  async clearTasks(): Promise<void> {
    await db.delete(taskContent);
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

  async getActiveRound(sessionId: string, category: string): Promise<CategoryRound | null> {
    const rows = await db
      .select()
      .from(categoryRounds)
      .where(
        and(
          eq(categoryRounds.sessionId, sessionId),
          eq(categoryRounds.category, category),
          eq(categoryRounds.status, "active")
        )
      );
    return rows.length > 0 ? rows[0] : null;
  }

  async createRound(sessionId: string, category: string, roundNumber: number, taskIds: number[]): Promise<CategoryRound> {
    const [round] = await db
      .insert(categoryRounds)
      .values({
        sessionId,
        category,
        roundNumber,
        status: "active",
        currentIndex: 0,
        totalTasks: taskIds.length,
        correctCount: 0,
        wrongCount: 0,
      })
      .returning();

    if (taskIds.length > 0) {
      const taskRows = taskIds.map((taskId) => ({
        roundId: round.id,
        taskId,
        correctFirstAttempt: null as boolean | null,
        attempts: 0,
      }));
      await db.insert(roundTaskResults).values(taskRows);
    }

    return round;
  }

  async getRoundTasks(roundId: number): Promise<RoundTaskResult[]> {
    return db
      .select()
      .from(roundTaskResults)
      .where(eq(roundTaskResults.roundId, roundId));
  }

  async submitAnswer(roundId: number, taskId: number, correctFirstAttempt: boolean, attempts: number): Promise<boolean> {
    const existing = await db
      .select()
      .from(roundTaskResults)
      .where(
        and(
          eq(roundTaskResults.roundId, roundId),
          eq(roundTaskResults.taskId, taskId)
        )
      );

    if (existing.length > 0 && existing[0].completedAt !== null) {
      return false;
    }

    await db
      .update(roundTaskResults)
      .set({
        correctFirstAttempt,
        attempts,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(roundTaskResults.roundId, roundId),
          eq(roundTaskResults.taskId, taskId)
        )
      );

    if (correctFirstAttempt) {
      await db
        .update(categoryRounds)
        .set({ correctCount: sql`${categoryRounds.correctCount} + 1` })
        .where(eq(categoryRounds.id, roundId));
    } else {
      await db
        .update(categoryRounds)
        .set({ wrongCount: sql`${categoryRounds.wrongCount} + 1` })
        .where(eq(categoryRounds.id, roundId));
    }
    return true;
  }

  async advanceRoundIndex(roundId: number): Promise<void> {
    await db
      .update(categoryRounds)
      .set({ currentIndex: sql`${categoryRounds.currentIndex} + 1` })
      .where(eq(categoryRounds.id, roundId));
  }

  async completeRound(roundId: number): Promise<CategoryRound> {
    const [result] = await db
      .update(categoryRounds)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(categoryRounds.id, roundId))
      .returning();
    return result;
  }

  async getCategorySummary(sessionId: string, category: string): Promise<{ rounds: CategoryRound[], allResults: RoundTaskResult[] }> {
    const rounds = await db
      .select()
      .from(categoryRounds)
      .where(
        and(
          eq(categoryRounds.sessionId, sessionId),
          eq(categoryRounds.category, category)
        )
      );

    const allResults: RoundTaskResult[] = [];
    for (const round of rounds) {
      const results = await this.getRoundTasks(round.id);
      allResults.push(...results);
    }

    return { rounds, allResults };
  }

  async getAllCategorySummaries(sessionId: string): Promise<{ category: string, roundNumber: number, status: string, totalTasks: number, correctCount: number, wrongCount: number, currentIndex: number }[]> {
    const rounds = await db
      .select()
      .from(categoryRounds)
      .where(eq(categoryRounds.sessionId, sessionId));

    const latestByCategory = new Map<string, typeof rounds[0]>();
    for (const round of rounds) {
      const existing = latestByCategory.get(round.category);
      if (!existing || round.roundNumber > existing.roundNumber) {
        latestByCategory.set(round.category, round);
      }
    }

    return Array.from(latestByCategory.values()).map(r => ({
      category: r.category,
      roundNumber: r.roundNumber,
      status: r.status,
      totalTasks: r.totalTasks,
      correctCount: r.correctCount,
      wrongCount: r.wrongCount,
      currentIndex: r.currentIndex,
    }));
  }
}

export const storage = new DatabaseStorage();
