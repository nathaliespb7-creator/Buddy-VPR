/**
 * Валидатор ответов для «Острова предложений»:
 * подлежащее/сказуемое, расстановка запятых, комбинированные задания.
 */
import type { SentenceTask } from "./sentenceTypes";

export interface ValidationResult {
  score: 0 | 1 | 2;
  feedback: string;
  errors?: string[];
}

export class SyntaxValidator {
  validateAnswer(userAnswer: string, task: SentenceTask): ValidationResult {
    const normalizedUser = this.normalizeText(userAnswer);

    if (task.type === "find_subject_predicate") {
      return this.validateSubjectPredicate(normalizedUser, task);
    }

    if (task.type === "add_commas") {
      return this.validateCommas(normalizedUser, task);
    }

    if (task.type === "combined") {
      return this.validateCombined(normalizedUser, task);
    }

    return { score: 0, feedback: "Неизвестный тип задания" };
  }

  private validateSubjectPredicate(
    answer: string,
    task: SentenceTask
  ): ValidationResult {
    const errors: string[] = [];
    let score = 0;

    if (task.subject) {
      const foundSubjects = this.extractWords(answer);
      const correctSubjects = task.subject.filter((s) =>
        foundSubjects.some((f) => this.normalizeWord(f) === this.normalizeWord(s))
      );
      if (correctSubjects.length === task.subject.length) {
        score += 1;
      } else {
        errors.push(
          `Найдено ${correctSubjects.length} из ${task.subject.length} подлежащих`
        );
      }
    }

    if (task.predicate) {
      const foundPredicates = this.extractWords(answer);
      const correctPredicates = task.predicate.filter((p) =>
        foundPredicates.some((f) => this.normalizeWord(f) === this.normalizeWord(p))
      );
      if (correctPredicates.length === task.predicate.length) {
        score += 1;
      } else {
        errors.push(
          `Найдено ${correctPredicates.length} из ${task.predicate.length} сказуемых`
        );
      }
    }

    return {
      score: score as 0 | 1 | 2,
      feedback:
        score === 2
          ? "Отлично! Грамматическая основа найдена верно."
          : `Проверь: ${errors.join("; ")}`,
      errors: errors.length ? errors : undefined,
    };
  }

  private validateCommas(answer: string, task: SentenceTask): ValidationResult {
    const expected = this.normalizeText(task.corrected || "");
    const actual = this.normalizeText(answer);

    if (actual === expected) {
      return { score: 2, feedback: "Верно! Запятые расставлены правильно." };
    }

    if (
      (actual.match(/,/g) || []).length > 0 &&
      task.corrected &&
      this.hasCorrectCommaPosition(answer, task.corrected)
    ) {
      return {
        score: 1,
        feedback: "Почти верно! Проверь правило: " + task.rule,
      };
    }

    return {
      score: 0,
      feedback: "Запятые расставлены неверно. Правило: " + task.rule,
    };
  }

  private validateCombined(answer: string, task: SentenceTask): ValidationResult {
    const subjectPredicateResult = this.validateSubjectPredicate(answer, task);
    const commaResult = this.validateCommas(answer, task);

    const totalScore = subjectPredicateResult.score + commaResult.score;
    const finalScore = Math.min(
      2,
      Math.round(totalScore / 2)
    ) as 0 | 1 | 2;

    return {
      score: finalScore,
      feedback:
        finalScore === 2
          ? "Отлично! Всё верно."
          : `Основа: ${subjectPredicateResult.feedback}; Запятые: ${commaResult.feedback}`,
    };
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,!?;:]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private normalizeWord(w: string): string {
    return w.toLowerCase().trim();
  }

  private extractWords(text: string): string[] {
    return text
      .split(/\s+|—|–|-/)
      .map((s) => s.replace(/[.,!?;:]/g, "").trim())
      .filter(Boolean);
  }

  private hasCorrectCommaPosition(user: string, expected: string): boolean {
    const userChars = user.split("");
    const expectedChars = expected.split("");
    let matches = 0;
    for (let i = 0; i < Math.min(userChars.length, expectedChars.length); i++) {
      if (userChars[i] === "," && expectedChars[i] === ",") {
        matches++;
      }
    }
    return matches > 0;
  }
}

export const syntaxValidator = new SyntaxValidator();
