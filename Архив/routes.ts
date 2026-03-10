import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server | null,
  app: Express
): Promise<Server | null> {
  app.get("/api/rules", async (_req, res) => {
    try {
      const rules = await storage.getAllRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rules" });
    }
  });

  app.get("/api/rules/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const rules = await storage.getRulesByCategory(category);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rules" });
    }
  });

  app.get("/api/tasks", async (_req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const tasks = await storage.getTasksByCategory(category);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = {
        sessionId: req.body.sessionId,
        taskId: req.body.taskId,
        attempts: 1,
        hintsUsed: req.body.hintsUsed || 0,
        completed: true,
        correct: req.body.correct || false,
        completedAt: new Date(),
      };

      const progress = await storage.saveProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to save progress" });
    }
  });

  app.get("/api/progress/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const progress = await storage.getSessionProgress(sessionId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.get("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getOrCreateSession(sessionId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  app.put("/api/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.updateSession(sessionId, req.body);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  const roundQuerySchema = z.object({
    sessionId: z.string().min(1),
  });

  app.get("/api/round/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const parsed = roundQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "sessionId query param required" });
      }
      const { sessionId } = parsed.data;

      let round = await storage.getActiveRound(sessionId, category);

      if (!round) {
        const lastSummary = await storage.getCategorySummary(sessionId, category);
        const completedRounds = lastSummary.rounds.filter(r => r.status === "completed");

        if (completedRounds.length === 0) {
          const allTasks = await storage.getTasksByCategory(category);
          if (allTasks.length === 0) {
            return res.status(404).json({ error: "No tasks in this category" });
          }
          const taskIds = allTasks.map(t => t.id);
          round = await storage.createRound(sessionId, category, 1, taskIds);
        } else {
          const lastRound = completedRounds.sort((a, b) => b.roundNumber - a.roundNumber)[0];
          const lastResults = await storage.getRoundTasks(lastRound.id);
          const wrongTaskIds = lastResults
            .filter(r => r.correctFirstAttempt === false)
            .map(r => r.taskId);

          if (wrongTaskIds.length === 0) {
            return res.json({
              mastered: true,
              roundNumber: lastRound.roundNumber,
              totalTasks: lastRound.totalTasks,
              correctCount: lastRound.correctCount,
              wrongCount: lastRound.wrongCount,
            });
          }

          round = await storage.createRound(sessionId, category, lastRound.roundNumber + 1, wrongTaskIds);
        }
      }

      const taskResults = await storage.getRoundTasks(round.id);
      const completedTaskIds = taskResults.filter(r => r.completedAt !== null).map(r => r.taskId);
      const remainingTaskIds = taskResults.filter(r => r.completedAt === null).map(r => r.taskId);

      res.json({
        mastered: false,
        roundId: round.id,
        roundNumber: round.roundNumber,
        status: round.status,
        currentIndex: round.currentIndex,
        totalTasks: round.totalTasks,
        correctCount: round.correctCount,
        wrongCount: round.wrongCount,
        completedTaskIds,
        remainingTaskIds,
        allTaskIds: taskResults.map(r => r.taskId),
      });
    } catch (error) {
      console.error("Failed to get round:", error);
      res.status(500).json({ error: "Failed to get round" });
    }
  });

  const answerSchema = z.object({
    sessionId: z.string().min(1),
    taskId: z.number(),
    correctFirstAttempt: z.boolean(),
    attempts: z.number().min(1),
  });

  app.post("/api/round/:category/answer", async (req, res) => {
    try {
      const { category } = req.params;
      const parsed = answerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      }

      const { sessionId, taskId, correctFirstAttempt, attempts } = parsed.data;

      const round = await storage.getActiveRound(sessionId, category);
      if (!round) {
        return res.status(404).json({ error: "No active round" });
      }

      const wasNew = await storage.submitAnswer(round.id, taskId, correctFirstAttempt, attempts);
      if (wasNew) {
        await storage.advanceRoundIndex(round.id);
      }

      const taskResults = await storage.getRoundTasks(round.id);
      const allCompleted = taskResults.every(r => r.completedAt !== null);

      if (allCompleted) {
        const completedRound = await storage.completeRound(round.id);
        const wrongTaskIds = taskResults
          .filter(r => r.correctFirstAttempt === false)
          .map(r => r.taskId);

        return res.json({
          roundCompleted: true,
          roundNumber: completedRound.roundNumber,
          totalTasks: completedRound.totalTasks,
          correctCount: completedRound.correctCount,
          wrongCount: completedRound.wrongCount,
          wrongTaskIds,
          mastered: wrongTaskIds.length === 0,
        });
      }

      const updatedRound = await storage.getActiveRound(sessionId, category);
      res.json({
        roundCompleted: false,
        currentIndex: updatedRound?.currentIndex || 0,
        totalTasks: updatedRound?.totalTasks || round.totalTasks,
        correctCount: updatedRound?.correctCount || 0,
        wrongCount: updatedRound?.wrongCount || 0,
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
      res.status(500).json({ error: "Failed to submit answer" });
    }
  });

  app.get("/api/round/:category/summary", async (req, res) => {
    try {
      const { category } = req.params;
      const parsed = roundQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "sessionId query param required" });
      }
      const { sessionId } = parsed.data;

      const { rounds, allResults } = await storage.getCategorySummary(sessionId, category);
      const allTasks = await storage.getTasksByCategory(category);

      const completedRounds = rounds.filter(r => r.status === "completed");
      const activeRound = rounds.find(r => r.status === "active");
      const latestRound = activeRound || completedRounds.sort((a, b) => b.roundNumber - a.roundNumber)[0];

      if (!latestRound) {
        return res.json({
          totalTasksInCategory: allTasks.length,
          started: false,
        });
      }

      let wrongTaskIds: number[] = [];
      if (latestRound.status === "completed") {
        const latestResults = await storage.getRoundTasks(latestRound.id);
        wrongTaskIds = latestResults.filter(r => r.correctFirstAttempt === false).map(r => r.taskId);
      }

      const wrongWords = allTasks
        .filter(t => wrongTaskIds.includes(t.id))
        .map(t => ({ id: t.id, word: t.word }));

      res.json({
        totalTasksInCategory: allTasks.length,
        started: true,
        roundNumber: latestRound.roundNumber,
        status: latestRound.status,
        currentIndex: latestRound.currentIndex,
        totalTasks: latestRound.totalTasks,
        correctCount: latestRound.correctCount,
        wrongCount: latestRound.wrongCount,
        wrongWords,
        mastered: latestRound.status === "completed" && wrongTaskIds.length === 0,
      });
    } catch (error) {
      console.error("Failed to get summary:", error);
      res.status(500).json({ error: "Failed to get summary" });
    }
  });

  app.get("/api/categories/progress", async (req, res) => {
    try {
      const parsed = roundQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "sessionId query param required" });
      }
      const { sessionId } = parsed.data;

      const summaries = await storage.getAllCategorySummaries(sessionId);
      const allTasks = await storage.getAllTasks();

      const taskCountByCategory = new Map<string, number>();
      for (const task of allTasks) {
        taskCountByCategory.set(task.category, (taskCountByCategory.get(task.category) || 0) + 1);
      }

      const result = summaries.map(s => ({
        ...s,
        totalTasksInCategory: taskCountByCategory.get(s.category) || 0,
      }));

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to get category progress" });
    }
  });

  return httpServer;
}

