/**
 * Fuzzy-валидатор текстовых ответов с защитой от ложных срабатываний:
 * 1) этический фильтр (unacceptablePatterns),
 * 2) минимум ключевых слов,
 * 3) семантическое сходство (Levenshtein + overlap ключевых слов).
 */

export interface ValidationConfig {
  acceptableAnswers: string[];
  unacceptablePatterns: string[];
  keywords: string[];
  /** Минимальное кол-во ключевых слов для прохождения (по умолчанию 40% от списка). */
  minKeywordMatch?: number;
}

export interface ValidationResult {
  score: 0 | 1;
  feedback: string;
  matchedPattern?: string;
  matchedKeywords?: string[];
  /** Для детского UI: при score 0 и частичном совпадении — подсказка, какое слово добавить. */
  similarityScore?: number;
  suggestedKeyword?: string;
}

export class TextAnswerValidator {
  private readonly SIMILARITY_THRESHOLD = 0.65;
  private readonly KEYWORD_WEIGHT = 0.3;
  private readonly SEMANTIC_WEIGHT = 0.7;

  /**
   * Основная функция валидации
   */
  validate(userAnswer: string, config: ValidationConfig): ValidationResult {
    const normalizedAnswer = this.normalizeText(userAnswer);

    // 1. Проверка на недопустимые паттерны (этический фильтр)
    const unethicalMatch = this.checkUnacceptablePatterns(
      normalizedAnswer,
      config.unacceptablePatterns
    );
    if (unethicalMatch) {
      return {
        score: 0,
        feedback:
          "Твой ответ содержит некорректную ситуацию. Подумай: это этично?",
        matchedPattern: unethicalMatch,
      };
    }

    // 2. Проверка по ключевым словам (быстрый фильтр)
    const matchedKeywords = this.extractMatchedKeywords(
      normalizedAnswer,
      config.keywords
    );
    const minKeywords =
      config.minKeywordMatch ?? Math.max(1, Math.ceil(config.keywords.length * 0.4));

    if (matchedKeywords.length < minKeywords) {
      return {
        score: 0,
        feedback: `Попробуй использовать больше ключевых слов: ${config.keywords.slice(0, 3).join(", ")}...`,
        matchedKeywords,
      };
    }

    // 3. Семантическое сравнение с acceptableAnswers
    const bestMatch = this.findBestSemanticMatch(
      normalizedAnswer,
      config.acceptableAnswers
    );

    if (bestMatch.score >= this.SIMILARITY_THRESHOLD) {
      return {
        score: 1,
        feedback: "Верно! Ты правильно понял(а) значение.",
        matchedKeywords,
      };
    }

    // 4. Частичное совпадение (для 1 балла в развёрнутых ответах)
    if (bestMatch.score >= this.SIMILARITY_THRESHOLD * 0.7) {
      return {
        score: 1,
        feedback: "Почти верно! Попробуй сформулировать точнее.",
        matchedKeywords,
      };
    }

    // 5. Почти дотянул: отдаём similarityScore и подсказку по ключевому слову для детского UI
    const suggestedKeyword =
      config.keywords.find((kw) => !matchedKeywords.includes(kw)) ?? "главный";
    return {
      score: 0,
      feedback:
        "Похоже, значение понято не совсем верно. Прочитай предложение ещё раз.",
      matchedKeywords,
      similarityScore: bestMatch.score,
      suggestedKeyword,
    };
  }

  /**
   * Нормализация текста: нижний регистр, удаление пунктуации, лишних пробелов
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,!?;:«»""—–\-(){}\[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Проверка на недопустимые паттерны (exact substring match)
   */
  private checkUnacceptablePatterns(
    answer: string,
    patterns: string[]
  ): string | null {
    for (const pattern of patterns) {
      const normalizedPattern = this.normalizeText(pattern);
      if (answer.includes(normalizedPattern)) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Извлечение совпавших ключевых слов
   */
  private extractMatchedKeywords(
    answer: string,
    keywords: string[]
  ): string[] {
    return keywords.filter((kw) => {
      const normalizedKw = this.normalizeText(kw);
      return answer.includes(normalizedKw);
    });
  }

  /**
   * Поиск лучшего семантического совпадения (Levenshtein + keyword overlap)
   */
  private findBestSemanticMatch(
    answer: string,
    acceptableAnswers: string[]
  ): { score: number; answer: string } {
    let bestScore = 0;
    let bestAnswer = "";

    for (const acceptable of acceptableAnswers) {
      const normalizedAcceptable = this.normalizeText(acceptable);

      const semanticScore = this.calculateLevenshteinSimilarity(
        answer,
        normalizedAcceptable
      );

      const answerWords = new Set(answer.split(" ").filter(Boolean));
      const acceptableWords = normalizedAcceptable.split(" ").filter(Boolean);
      const keywordOverlap =
        acceptableWords.length === 0
          ? 0
          : acceptableWords.filter((w) => answerWords.has(w)).length /
            acceptableWords.length;

      const combinedScore =
        semanticScore * this.SEMANTIC_WEIGHT +
        keywordOverlap * this.KEYWORD_WEIGHT;

      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestAnswer = acceptable;
      }
    }

    return { score: bestScore, answer: bestAnswer };
  }

  /**
   * Расчёт сходства по Левенштейну (0–1)
   */
  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Расстояние Левенштейна
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] =
            Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export const textAnswerValidator = new TextAnswerValidator();
