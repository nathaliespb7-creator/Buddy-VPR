/**
 * Типы модуля «Математика ВПР 4 класс 2026» (ФИОКО).
 * Используются в конфиге островов, примерах заданий и валидаторе.
 */

export type VprTaskNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type MathTaskType =
  | "number_input"
  | "text_input"
  | "text_solution"
  | "drawing"
  | "time_input"
  | "mixed"
  | "expression"
  | "written_operations";

export type MathDifficulty = "базовый" | "повышенный";

export interface MathIslandVpr {
  id: string;
  name: string;
  tasks: number[];
  color: string;
  icon: string;
  description: string;
}

export interface MathModuleConfig {
  module_id: string;
  app_name: string;
  subject: string;
  grade: number;
  year: number;
  source: string;
  total_tasks: number;
  max_score: number;
  time_limit_minutes: number;
  scoring_scale: Record<string, string>;
  islands: MathIslandVpr[];
}

/** Базовые поля примера задания (общие для всех типов). */
export interface MathTaskExampleBase {
  id: string;
  vpr_task_number: VprTaskNumber;
  question: string;
  difficulty: MathDifficulty;
  max_score: 1 | 2;
  /** Подсказка для ребёнка (magicHint). */
  magicHint?: string;
  /** Критерии оценивания: описание за 0, 1, 2 балла. */
  scoring_criteria?: Record<string, string>;
  /** Подсказки по методикам (Школа России, Петерсон, Эльконин). */
  hints?: Record<string, string>;
  /** Типичные неверные ответы для аналитики/подсказок. */
  common_mistakes?: Array<string | number | { answer: string; error: string }>;
}

/** Задание с числовым ответом (№ 1, 2, 7). correct_answer может быть строкой для формата «9 (ост. 2)». */
export interface MathTaskNumberExample extends MathTaskExampleBase {
  correct_answer: number | string;
  type: "number_input";
}

/** Задание на вычисление выражения (№ 2): порядок действий, один числовой ответ. */
export interface MathTaskExpressionExample extends MathTaskExampleBase {
  correct_answer: number;
  type: "expression";
}

/** Задание на письменные вычисления (№ 7): столбик, один числовой ответ или «частное (ост. остаток)». */
export interface MathTaskWrittenExample extends MathTaskExampleBase {
  correct_answer: number | string;
  type: "written_operations";
}

/** Задание с ответом «время» (№ 4). */
export interface MathTaskTimeExample extends MathTaskExampleBase {
  correct_answer: string;
  type: "time_input";
}

/** Задание «решение + ответ» (№ 3, 8, 11). */
export interface MathTaskSolutionExample extends MathTaskExampleBase {
  correct_answer: string;
  correct_solution: string;
  type: "text_solution";
  partial_credit?: boolean;
  image?: string;
  prices?: Record<string, number>;
}

/** Задание с чертежом (№ 10). */
export interface MathTaskDrawingExample extends MathTaskExampleBase {
  correct_answer: string;
  type: "drawing";
  image_part1?: string;
  image_part2?: string;
  image?: string;
}

/** Задание смешанное: число + чертёж (№ 5). */
export interface MathTaskMixedExample extends MathTaskExampleBase {
  question_part1?: string;
  question_part2?: string;
  correct_answer_part1: number;
  correct_answer_part2: string;
  type: "mixed";
  image?: string;
  grid_cell_cm?: number;
}

/** Задание с коротким текстовым ответом (№ 9 — два ответа). */
export interface MathTaskTextExample extends MathTaskExampleBase {
  correct_answer: string;
  type: "text_input";
}

/** Задание с двумя числами (№ 6 — таблицы/диаграммы, 2 вопроса). */
export interface MathTaskTwoNumbersExample extends MathTaskExampleBase {
  correct_answer: [number, number];
  type: "number_input";
  /** Для № 6: два подвопроса. */
  question_part1?: string;
  question_part2?: string;
}

export type MathTaskExample =
  | MathTaskNumberExample
  | MathTaskExpressionExample
  | MathTaskWrittenExample
  | MathTaskTimeExample
  | MathTaskSolutionExample
  | MathTaskDrawingExample
  | MathTaskMixedExample
  | MathTaskTextExample
  | MathTaskTwoNumbersExample;
