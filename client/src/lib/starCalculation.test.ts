/**
 * Тесты логики начисления звёзд (защита от накрутки).
 * Запуск: npm test (Vitest) или npx jest (если настроен Jest).
 */

import { describe, it, expect } from "vitest";
import { calculateNewStars } from "./starCalculation";

const emptyStars = { total: 0, gold: 0, silver: 0 };

describe("calculateNewStars", () => {
  describe("новая задача (taskId ещё не в истории)", () => {
    it("добавляет золотую звезду: total+1, gold+1", () => {
      const result = calculateNewStars({
        taskId: "42",
        starType: "gold",
        currentStars: emptyStars,
      });
      expect(result.stars).toEqual({ total: 1, gold: 1, silver: 0 });
      expect(result.starByTaskId["42"]).toBe("gold");
    });

    it("добавляет серебряную звезду: total+1, silver+1", () => {
      const result = calculateNewStars({
        taskId: "10",
        starType: "silver",
        currentStars: emptyStars,
      });
      expect(result.stars).toEqual({ total: 1, gold: 0, silver: 1 });
      expect(result.starByTaskId["10"]).toBe("silver");
    });

    it("корректно добавляет к существующим счётчикам", () => {
      const current = { total: 5, gold: 3, silver: 2 };
      const result = calculateNewStars({
        taskId: "99",
        starType: "gold",
        currentStars: current,
      });
      expect(result.stars).toEqual({ total: 6, gold: 4, silver: 2 });
      expect(result.starByTaskId["99"]).toBe("gold");
    });
  });

  describe("повтор (ре-три): задача уже была", () => {
    it("улучшение silver → gold: total не меняется, gold+1, silver-1", () => {
      const current = { total: 10, gold: 4, silver: 6 };
      const starByTaskId = { "42": "silver" as const };
      const result = calculateNewStars({
        taskId: "42",
        starType: "gold",
        currentStars: current,
        starByTaskId,
      });
      expect(result.stars).toEqual({ total: 10, gold: 5, silver: 5 });
      expect(result.starByTaskId["42"]).toBe("gold");
    });

    it("уже gold, повтор с gold: total и счётчики не меняются", () => {
      const current = { total: 8, gold: 5, silver: 3 };
      const starByTaskId = { "1": "gold" as const };
      const result = calculateNewStars({
        taskId: "1",
        starType: "gold",
        currentStars: current,
        starByTaskId,
      });
      expect(result.stars).toEqual({ total: 8, gold: 5, silver: 3 });
      expect(result.starByTaskId["1"]).toBe("gold");
    });

    it("уже gold, повтор с silver: не понижаем, total и счётчики без изменений", () => {
      const current = { total: 7, gold: 4, silver: 3 };
      const starByTaskId = { "5": "gold" as const };
      const result = calculateNewStars({
        taskId: "5",
        starType: "silver",
        currentStars: current,
        starByTaskId,
      });
      expect(result.stars).toEqual({ total: 7, gold: 4, silver: 3 });
      expect(result.starByTaskId["5"]).toBe("silver"); // карта обновлена, но счётчики нет
    });

    it("silver → silver (повтор без улучшения): total не растёт", () => {
      const current = { total: 3, gold: 1, silver: 2 };
      const starByTaskId = { "2": "silver" as const };
      const result = calculateNewStars({
        taskId: "2",
        starType: "silver",
        currentStars: current,
        starByTaskId,
      });
      expect(result.stars).toEqual({ total: 3, gold: 1, silver: 2 });
    });

    it("silver→gold при одной серебряной: silver не уходит в минус", () => {
      const current = { total: 1, gold: 0, silver: 1 };
      const starByTaskId = { "1": "silver" as const };
      const result = calculateNewStars({
        taskId: "1",
        starType: "gold",
        currentStars: current,
        starByTaskId,
      });
      expect(result.stars).toEqual({ total: 1, gold: 1, silver: 0 });
      expect(result.stars.silver).toBeGreaterThanOrEqual(0);
    });
  });

  describe("защита от накрутки", () => {
    it("10 заданий по 10 раз = 10 звёзд в total, не 100", () => {
      let stars = { total: 0, gold: 0, silver: 0 };
      let starByTaskId: Record<string, "gold" | "silver"> = {};

      for (let taskId = 1; taskId <= 10; taskId++) {
        for (let attempt = 0; attempt < 10; attempt++) {
          const starType = attempt === 0 ? "gold" : "silver";
          const r = calculateNewStars({
            taskId: String(taskId),
            starType,
            currentStars: stars,
            starByTaskId,
          });
          stars = r.stars;
          starByTaskId = r.starByTaskId;
        }
      }

      expect(stars.total).toBe(10);
      expect(stars.gold).toBe(10);
      expect(stars.silver).toBe(0);
    });
  });
});
