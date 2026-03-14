/**
 * Единый конфиг предметов для логики игры: источник заданий и острова (для математики — по номерам ВПР).
 * Используется в MathPlayPage и при проверке subject === 'math' для загрузки заданий.
 */

import { mathVprGrade4Config } from "@/data/mathVprGrade4";

export type PlaySubjectId = "russian" | "math";

export interface MathIslandPlay {
  id: string;
  name: string;
  /** Номера заданий ВПР (1–11) в этом острове. */
  tasks: number[];
}

export interface SubjectPlayConfig {
  name: string;
  icon: string;
  color: string;
  tasksSource: "tasksData" | "mathTaskExamples";
  /** Для русского — категории берутся из data/subjectsConfig (key: accent, phonetics, …). Для математики — острова ВПР с номерами заданий. */
  islands: MathIslandPlay[];
}

/** Острова математики ВПР 4 класс: один источник правды — mathVprGrade4Config. */
const mathIslands: MathIslandPlay[] = mathVprGrade4Config.islands.map((i) => ({
  id: i.id,
  name: i.name,
  tasks: i.tasks,
}));

export const subjectsConfig: Record<PlaySubjectId, SubjectPlayConfig> = {
  russian: {
    name: "Русский язык",
    icon: "📝",
    color: "#667eea",
    tasksSource: "tasksData",
    islands: [], // Категории (острова) берутся из data/subjectsConfig, задания — из tasksData по category.
  },
  math: {
    name: "Математика",
    icon: "🔢",
    color: "#22c55e",
    tasksSource: "mathTaskExamples",
    islands: mathIslands,
  },
};
