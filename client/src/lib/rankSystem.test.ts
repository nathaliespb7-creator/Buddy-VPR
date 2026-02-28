/**
 * Тесты адаптивной системы рангов (getRankInfo).
 */

import { describe, it, expect } from "vitest";
import { getRankInfo } from "./rankSystem";

describe("getRankInfo", () => {
  it("Free режим (moduleCapacity === null): rank и progress null", () => {
    const result = getRankInfo(50, null);
    expect(result.rank).toBeNull();
    expect(result.progressPercent).toBeNull();
    expect(result.nextRankThresholdPercent).toBeNull();
  });

  it("Premium 0%: Новичок, прогресс 0, следующий порог 20%", () => {
    const result = getRankInfo(0, 100);
    expect(result.rank).toBe("Новичок");
    expect(result.progressPercent).toBe(0);
    expect(result.nextRankThresholdPercent).toBe(20);
  });

  it("Premium 50%: Мастер (50 – <80), прогресс 50, следующий порог 80%", () => {
    const result = getRankInfo(50, 100);
    expect(result.rank).toBe("Мастер");
    expect(result.progressPercent).toBe(50);
    expect(result.nextRankThresholdPercent).toBe(80);
  });

  it("Premium 99%: Легенда, прогресс 99, следующего ранга нет", () => {
    const result = getRankInfo(99, 100);
    expect(result.rank).toBe("Легенда");
    expect(result.progressPercent).toBe(99);
    expect(result.nextRankThresholdPercent).toBeNull();
  });

  it("Premium 100%: Легенда, прогресс 100, следующего ранга нет", () => {
    const result = getRankInfo(100, 100);
    expect(result.rank).toBe("Легенда");
    expect(result.progressPercent).toBe(100);
    expect(result.nextRankThresholdPercent).toBeNull();
  });
});
