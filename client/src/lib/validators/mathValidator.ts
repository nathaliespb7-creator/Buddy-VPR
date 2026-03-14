/**
 * Валидатор ответов для модуля «Математика ВПР 4 класс 2026».
 * Критичные требования:
 * - Числа: форматы 1000, 1 000, 1.000
 * - Время: 15:45, 15 ч 45 мин, 15 часов 45 минут
 * - Partial credit для заданий 3, 8, 11 (1 балл за верный ход решения)
 */

export interface MathTask {
  id: string;
  vprTaskNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  type: "number_input" | "text_input" | "text_solution" | "drawing" | "time_input" | "mixed";
  correctAnswer: string | number | [number, number];
  correctSolution?: string;
  maxScore: 1 | 2;
  partialCredit?: boolean;
  /** Для type === "mixed": число (часть 1) и чертёж (часть 2). */
  correctAnswerPart1?: number;
  correctAnswerPart2?: string;
}

export interface MathValidationResult {
  score: 0 | 1 | 2;
  feedback: string;
  isCorrect: boolean;
  partialScore?: number;
  hint?: string;
}

/** Нормализация числа из ответа: убираем пробелы, запятую заменяем на точку. */
function normalizeNumberInput(raw: string): string {
  return raw.replace(/\s/g, "").replace(",", ".");
}

/** Нормализация ожидаемого числа (поддержка 1000, 1 000, 1.000). */
function normalizeExpectedNumber(value: string | number): string {
  const s = String(value).replace(/\s/g, "").replace(",", ".");
  return s;
}

export class MathValidator {
  validateAnswer(userAnswer: string, task: MathTask): MathValidationResult {
    switch (task.type) {
      case "number_input":
        return this.validateNumber(userAnswer, task);
      case "time_input":
        return this.validateTime(userAnswer, task);
      case "text_input":
        return this.validateText(userAnswer, task);
      case "text_solution":
        return this.validateSolution(userAnswer, task);
      case "drawing":
        return this.validateDrawing(userAnswer, task);
      case "mixed":
        return this.validateMixed(userAnswer, task);
      default:
        return { score: 0, feedback: "Неизвестный тип задания", isCorrect: false };
    }
  }

  private validateNumber(userAnswer: string, task: MathTask): MathValidationResult {
    const normalizedUser = normalizeNumberInput(userAnswer);
    const expected = task.correctAnswer;

    // Задание № 6 — два числа (формат "72 12" или "72|12" или "72, 12")
    if (Array.isArray(expected)) {
      const parts = normalizedUser.split(/[\s|,;]+/).filter(Boolean);
      if (parts.length >= 2) {
        const a = normalizeExpectedNumber(parts[0]);
        const b = normalizeExpectedNumber(parts[1]);
        const e0 = normalizeExpectedNumber(String(expected[0]));
        const e1 = normalizeExpectedNumber(String(expected[1]));
        if (a === e0 && b === e1) {
          return {
            score: task.maxScore,
            feedback: "Верно! Оба ответа правильные! 🌟",
            isCorrect: true,
          };
        }
        if (a === e0 || b === e1) {
          return {
            score: 1,
            feedback: "Один ответ верный, проверь второй.",
            isCorrect: false,
            partialScore: 0.5,
          };
        }
      }
      return {
        score: 0,
        feedback: "Введи два числа через пробел или запятую.",
        isCorrect: false,
      };
    }

    const expectedStr = normalizeExpectedNumber(String(expected));
    if (normalizedUser === expectedStr) {
      return {
        score: task.maxScore,
        feedback: "Верно! Молодец! 🌟",
        isCorrect: true,
      };
    }

    const userNum = parseFloat(normalizedUser);
    const expectedNum = parseFloat(expectedStr);

    if (!isNaN(userNum) && !isNaN(expectedNum) && Math.abs(userNum - expectedNum) <= 100) {
      return {
        score: task.partialCredit && task.maxScore === 2 ? 1 : 0,
        feedback: "Почти верно! Проверь вычисления.",
        isCorrect: false,
        partialScore: 0.5,
      };
    }

    return {
      score: 0,
      feedback: "Неверно. Попробуй ещё раз!",
      isCorrect: false,
    };
  }

  private validateTime(userAnswer: string, task: MathTask): MathValidationResult {
    // Форматы: 15:45, 15 ч 45 мин, 15 часов 45 минут, 15ч 45м
    const timePatterns = [
      /(\d{1,2}):(\d{2})/,
      /(\d{1,2})\s*ч\s*(\d{2})?\s*м/i,
      /(\d{1,2})\s*час\s*(\d{2})?\s*мин/i,
      /(\d{1,2})\s*часов?\s*(\d{2})?\s*минут?/i,
    ];

    const expected = String(task.correctAnswer).trim();
    const normalizedExpected = expected.replace(/\s/g, "");

    for (const pattern of timePatterns) {
      const match = userAnswer.match(pattern);
      if (match) {
        const hours = match[1]!.padStart(2, "0");
        const minutes = (match[2] || "00").padStart(2, "0");
        const normalized = `${hours}:${minutes}`;
        const normalizedAlt = `${parseInt(hours, 10)}:${minutes}`;

        if (
          normalized === normalizedExpected ||
          normalized === expected ||
          normalizedAlt === normalizedExpected ||
          normalized.replace(/^0/, "") === normalizedExpected.replace(/^0/, "")
        ) {
          return {
            score: task.maxScore,
            feedback: "Верно! Время указано правильно! ⏰",
            isCorrect: true,
          };
        }
      }
    }

    return {
      score: 0,
      feedback:
        "Неверно. Проверь формат времени (например, 15:45 или 15 часов 45 минут).",
      isCorrect: false,
    };
  }

  private validateSolution(userAnswer: string, task: MathTask): MathValidationResult {
    const normalizedUser = this.normalizeText(userAnswer);
    const expectedAnswer = this.normalizeText(String(task.correctAnswer));
    const expectedSolution = task.correctSolution
      ? this.normalizeText(task.correctSolution)
      : "";

    const hasCorrectAnswer =
      normalizedUser.includes(expectedAnswer) ||
      expectedAnswer.includes(normalizedUser) ||
      this.extractNumberFromAnswer(normalizedUser) === this.extractNumberFromAnswer(expectedAnswer);

    const hasSolutionSteps = expectedSolution
      ? expectedSolution
          .split("\n")
          .filter((step) => {
            const key = this.normalizeText(step.substring(0, 30));
            return key && normalizedUser.includes(key);
          }).length >= 2
      : false;

    if (hasCorrectAnswer) {
      return {
        score: task.maxScore,
        feedback: "Верно! Решение правильное! ✅",
        isCorrect: true,
      };
    }

    if (hasSolutionSteps && task.maxScore === 2 && task.partialCredit) {
      return {
        score: 1,
        feedback: "Ход решения верный, но ошибка в вычислениях.",
        isCorrect: false,
        partialScore: 0.5,
      };
    }

    return {
      score: 0,
      feedback: "Неверно. Проверь условие и вычисления.",
      isCorrect: false,
    };
  }

  private extractNumberFromAnswer(text: string): string {
    const match = text.match(/\d+/g);
    return match ? match[match.length - 1] ?? "" : "";
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,!?;:()]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/руб\.?/g, "руб")
      .replace(/часов?\s*/g, "ч ")
      .replace(/минут?\s*/g, "мин ")
      .trim();
  }

  private validateDrawing(userAnswer: string, task: MathTask): MathValidationResult {
    const isCorrect =
      userAnswer === "correct_drawing" ||
      userAnswer === task.correctAnswer ||
      (typeof task.correctAnswer === "string" && userAnswer.trim().length > 0);

    if (task.correctAnswer === "mirror_drawing" && userAnswer.trim().length > 0) {
      return {
        score: task.maxScore,
        feedback: "Чертёж принят! Верное зеркальное отражение! 📐",
        isCorrect: true,
      };
    }

    if (isCorrect && userAnswer !== "") {
      return {
        score: task.maxScore,
        feedback: "Верно! Чертеж правильный! 📐",
        isCorrect: true,
      };
    }

    return {
      score: 0,
      feedback: "Неверно. Проверь условие и перерисуй.",
      isCorrect: false,
    };
  }

  private validateMixed(userAnswer: string, task: MathTask): MathValidationResult {
    const parts = userAnswer.split("|");
    const numberPart = (parts[0] ?? "").trim();
    const drawingPart = (parts[1] ?? "").trim();

    const numValue =
      task.correctAnswerPart1 ??
      (typeof task.correctAnswer === "number" ? task.correctAnswer : 0);
    const numberResult = this.validateNumber(numberPart, {
      ...task,
      type: "number_input",
      maxScore: 1,
      correctAnswer: numValue,
    });
    const drawingResult = this.validateDrawing(drawingPart, {
      ...task,
      type: "drawing",
      maxScore: 1,
      correctAnswer: task.correctAnswerPart2 ?? "line_drawing",
    });

    const totalScore = (numberResult.score + drawingResult.score) as 0 | 1 | 2;

    return {
      score: totalScore,
      feedback:
        totalScore === 2
          ? "Верно! Оба задания выполнены! 🎉"
          : totalScore === 1
            ? "Одна часть верная, вторая — нет."
            : "Неверно. Попробуй ещё раз!",
      isCorrect: totalScore === 2,
    };
  }

  private validateText(userAnswer: string, task: MathTask): MathValidationResult {
    const normalizedUser = this.normalizeText(userAnswer);
    const expected = this.normalizeText(String(task.correctAnswer));

    if (
      normalizedUser.includes(expected) ||
      expected.includes(normalizedUser) ||
      (expected.includes("нет") && normalizedUser === "нет") ||
      (expected.includes("да") && normalizedUser === "да")
    ) {
      return {
        score: task.maxScore,
        feedback: "Верно! 🎯",
        isCorrect: true,
      };
    }

    return {
      score: 0,
      feedback: "Неверно. Прочитай условие ещё раз.",
      isCorrect: false,
    };
  }
}

export const mathValidator = new MathValidator();
