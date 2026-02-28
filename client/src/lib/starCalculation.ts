/**
 * Чистая логика начисления звёзд с защитой от накрутки.
 * Одно задание (taskId) — максимум одна звезда в total.
 * Спецификация: docs/MOTIVATION-AND-STARS.md, Фаза 2.
 */

import type { StarCounts, StarTypeEarned } from "@/types/motivation";

export interface CalculateNewStarsInput {
  taskId: string;
  starType: StarTypeEarned;
  currentStars: StarCounts;
  starByTaskId?: Record<string, StarTypeEarned>;
}

export interface CalculateNewStarsResult {
  stars: StarCounts;
  starByTaskId: Record<string, StarTypeEarned>;
}

/**
 * Вычисляет новые счётчики звёзд и обновлённую карту taskId → тип после попытки.
 * Не мутирует входные данные.
 *
 * Правила:
 * - Новая задача: total+1, gold или silver +1, записать taskId.
 * - Повтор (ре-три): total не меняем. Улучшение silver→gold: gold+1, silver-1. Иначе без изменений счётчиков.
 */
export function calculateNewStars(input: CalculateNewStarsInput): CalculateNewStarsResult {
  const { taskId, starType, currentStars, starByTaskId = {} } = input;
  const prev = starByTaskId[taskId];
  const nextMap = { ...starByTaskId, [taskId]: starType };

  // Новая задача — ранее не было звезды за этот taskId
  if (prev === undefined) {
    return {
      stars: {
        total: currentStars.total + 1,
        gold: starType === "gold" ? currentStars.gold + 1 : currentStars.gold,
        silver: starType === "silver" ? currentStars.silver + 1 : currentStars.silver,
      },
      starByTaskId: nextMap,
    };
  }

  // Повтор: total не увеличиваем
  if (prev === "gold") {
    // Уже золото — даже если пришло silver, не понижаем
    return {
      stars: { ...currentStars },
      starByTaskId: nextMap,
    };
  }

  // prev === "silver"
  if (starType === "gold") {
    // Улучшение: silver → gold
    return {
      stars: {
        total: currentStars.total,
        gold: currentStars.gold + 1,
        silver: Math.max(0, currentStars.silver - 1),
      },
      starByTaskId: nextMap,
    };
  }

  // silver → silver: без изменений счётчиков
  return {
    stars: { ...currentStars },
    starByTaskId: nextMap,
  };
}
