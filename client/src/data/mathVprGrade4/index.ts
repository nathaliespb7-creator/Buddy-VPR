/**
 * Модуль «Математика ВПР 4 класс 2026» (ФИОКО).
 * Экспорт конфига, примеров заданий, подсказок и типов для интеграции.
 */

export { mathVprGrade4Config } from "./moduleConfig";
export { mathTaskExamples, getExamplesByVprNumber } from "./taskExamples";
export { mathMethodologyHints, mathMagicHints } from "./hints";
export type {
  MathModuleConfig,
  MathIslandVpr,
  MathTaskExample,
  MathTaskType,
  MathDifficulty,
  VprTaskNumber,
} from "./types";
