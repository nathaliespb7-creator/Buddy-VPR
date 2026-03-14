/**
 * Конфиг модуля «Математика ВПР 4 класс 2026» (ФИОКО).
 * Структура работы: 11 заданий, 45 мин, макс. 18 баллов.
 */

import type { MathModuleConfig } from "./types";

export const mathVprGrade4Config: MathModuleConfig = {
  module_id: "buddy_vpr_math_grade4",
  app_name: "Бадди ВПР",
  subject: "mathematics",
  grade: 4,
  year: 2026,
  source: "ФИОКО ВПР 2026",
  total_tasks: 11,
  max_score: 18,
  time_limit_minutes: 45,
  scoring_scale: {
    "2": "0-4 балла",
    "3": "5-8",
    "4": "9-13",
    "5": "14-18",
  },
  islands: [
    {
      id: "island_arithmetic",
      name: "Остров Вычислений",
      tasks: [1, 2, 7],
      color: "#22c55e",
      icon: "🔢",
      description: "Сложение, вычитание, умножение, деление, выражения",
    },
    {
      id: "island_problems",
      name: "Остров Задач",
      tasks: [3, 4, 8],
      color: "#3b82f6",
      icon: "📝",
      description: "Текстовые задачи, время, величины",
    },
    {
      id: "island_geometry",
      name: "Остров Геометрии",
      tasks: [5, 10],
      color: "#f59e0b",
      icon: "📐",
      description: "Площадь, периметр, чертёж, симметрия",
    },
    {
      id: "island_data",
      name: "Остров Данных",
      tasks: [6, 9],
      color: "#8b5cf6",
      icon: "📊",
      description: "Таблицы, диаграммы, логика",
    },
    {
      id: "island_logic",
      name: "Остров Логики",
      tasks: [11],
      color: "#ef4444",
      icon: "🧩",
      description: "Нестандартные задачи",
    },
  ],
};
