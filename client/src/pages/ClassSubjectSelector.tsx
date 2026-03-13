import { useState } from "react";
import { useLocation } from "wouter";
import { CLASSES, SUBJECTS } from "@/data/subjectsAndClasses";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Страница выбора класса и предмета перед переходом на главную (карта островов).
 * Для MVP кнопка «Начать» ведёт на "/"; позже можно передавать subject/class в URL или контекст.
 */
export default function ClassSubjectSelector() {
  const [, setLocation] = useLocation();
  const [selectedClass, setSelectedClass] = useState<string>(String(CLASSES[0]));
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(SUBJECTS[0]!.id);

  const handleStart = () => {
    setLocation("/play");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-sky-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Выбери класс и предмет
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Подготовка к ВПР: выбери класс и предмет, затем нажми «Начать».
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Класс
            </label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите класс" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((grade) => (
                  <SelectItem key={grade} value={String(grade)}>
                    {grade} класс
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Предмет
            </label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleStart}
            className="w-full min-h-[48px] text-base font-semibold"
            size="lg"
          >
            Начать
          </Button>
        </div>
      </div>
    </main>
  );
}
