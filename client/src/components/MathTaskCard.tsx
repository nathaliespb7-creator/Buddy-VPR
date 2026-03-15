/**
 * Карточка задания по математике ВПР 4 класс.
 * Поддерживает number_input, expression, written_operations, time_input, text_input, text_solution, drawing, mixed.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GeometryCanvas } from "@/components/GeometryCanvas";
import { TaskImage } from "@/components/TaskImage";
import { DataTable } from "@/components/DataTable";
import { ballsPhrase } from "@/lib/utils";
import type { MathTaskExample } from "@/data/mathVprGrade4/types";

interface MathTaskCardProps {
  task: MathTaskExample;
  onAnswer: (answer: string) => void;
  taskIndex: number;
  totalTasks: number;
}

export function MathTaskCard({ task, onAnswer, taskIndex, totalTasks }: MathTaskCardProps) {
  const [answer, setAnswer] = useState("");
  const [drawing, setDrawing] = useState("");
  const [hintVisible, setHintVisible] = useState(false);

  const handleSubmit = () => {
    if (task.type === "mixed") {
      onAnswer(`${answer}|${drawing}`);
    } else {
      onAnswer(answer || drawing);
    }
  };

  const question =
    task.type === "mixed" && task.question_part1 && task.question_part2
      ? `${task.question_part1}\n\n${task.question_part2}`
      : task.question;

  const canSubmit =
    task.type === "drawing" ? drawing.length > 0 : task.type === "mixed" ? answer.length > 0 || drawing.length > 0 : answer.trim().length > 0;

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Задание №{task.vpr_task_number}</span>
        <span>
          {taskIndex + 1} из {totalTasks} · макс. {ballsPhrase(task.max_score)}
        </span>
      </div>

      <p className="text-base font-medium text-foreground whitespace-pre-wrap">{question}</p>

      {(task.type === "text_solution" || task.type === "drawing") && "image" in task && task.image && (
        <TaskImage
          src={typeof task.image === "string" ? task.image : task.image}
          zoomable
        />
      )}

      {"table" in task && task.table && (
        <DataTable
          columns={task.table.columns}
          data={task.table.data}
          caption={task.table.caption}
        />
      )}

      {task.type === "drawing" && (
        <GeometryCanvas
          taskType={task.vpr_task_number === 10 ? "mirror_reflection" : "circle_draw"}
          initialImage={"image" in task && task.image ? (typeof task.image === "string" ? task.image : task.image.src) : undefined}
          onDrawComplete={setDrawing}
        />
      )}

      {task.type === "mixed" && (
        <>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ответ (число)"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-base"
            aria-label="Числовой ответ"
          />
          <GeometryCanvas
            taskType="rectangle_split"
            initialImage={"image" in task && task.image ? (typeof task.image === "string" ? task.image : task.image.src) : undefined}
            onDrawComplete={setDrawing}
          />
        </>
      )}

      {task.type === "text_solution" && (
        <textarea
          placeholder="Запиши решение и ответ"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2 text-base min-h-[120px]"
          rows={5}
          aria-label="Решение и ответ"
        />
      )}

      {(task.type === "number_input" ||
        task.type === "expression" ||
        task.type === "written_operations" ||
        task.type === "time_input" ||
        task.type === "text_input") && (
        <input
          type="text"
          inputMode={task.type === "number_input" || task.type === "expression" ? "numeric" : "text"}
          placeholder={
            task.type === "time_input"
              ? "Например: 15:45 или 15 ч 45 мин"
              : task.type === "written_operations"
                ? "Число или частное (ост. остаток)"
                : "Введи ответ"
          }
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full rounded-lg border bg-background px-3 py-2 text-base"
          aria-label="Ответ"
        />
      )}

      {task.magicHint && (
        <div className="space-y-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setHintVisible((v) => !v)}
            className="gap-1.5"
            aria-expanded={hintVisible}
            aria-label={hintVisible ? "Скрыть подсказку" : "Показать подсказку"}
          >
            <span aria-hidden>🔦</span>
            {hintVisible ? "Скрыть подсказку" : "Подсказка"}
          </Button>
          {hintVisible && (
            <p className="text-sm text-muted-foreground pt-1">💡 {task.magicHint}</p>
          )}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full min-h-[48px]"
        size="lg"
      >
        Проверить
      </Button>
    </div>
  );
}
