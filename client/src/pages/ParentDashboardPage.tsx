import { useEffect, useMemo, useState } from "react";
import { useParentChildren, useChildSummary, useProgressStatus } from "@/hooks/useParentDashboard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] ?? "").toUpperCase() + (parts[1]![0] ?? "").toUpperCase();
}

export default function ParentDashboardPage() {
  const { data: children, isLoading: childrenLoading } = useParentChildren();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!childrenLoading && children && children.length > 0 && !selectedId) {
      setSelectedId(children[0]!.id);
    }
  }, [childrenLoading, children, selectedId]);

  const { data: summary } = useChildSummary(selectedId);

  const currentChild = useMemo(
    () => children?.find((c) => c.id === selectedId) ?? children?.[0],
    [children, selectedId],
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-sky-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Дашборд родителя
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Обзор прогресса ребенка в тренажёре «Бадди ВПР».
            </p>
          </div>
          <div className="w-full max-w-xs">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Ребенок
            </label>
            <Select
              value={currentChild?.id ?? undefined}
              onValueChange={(v) => setSelectedId(v)}
              disabled={!children || children.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={childrenLoading ? "Загрузка..." : "Выберите ребенка"} />
              </SelectTrigger>
              <SelectContent>
                {children?.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} · {child.classLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]">
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-base font-semibold text-slate-800">
                  {getInitials(currentChild?.name ?? "Ученик")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {currentChild?.name ?? "Ученик без имени"}
                </CardTitle>
                <CardDescription>
                  Класс: {currentChild?.classLabel ?? "—"}
                </CardDescription>
                {summary && (
                  <p className="mt-1 text-sm text-slate-700">
                    Ранг: <span className="font-semibold">{summary.rank}</span> · Звезды:{" "}
                    <span className="font-semibold">{summary.totalStars}</span> (золото{" "}
                    {summary.goldStars}, серебро {summary.silverStars})
                  </p>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Прогресс по предметам</CardTitle>
              <CardDescription>
                Сколько заданий выполнено и где нужна поддержка.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!summary && (
                <p className="text-sm text-slate-500">
                  Выберите ребенка, чтобы увидеть прогресс по предметам.
                </p>
              )}
              {summary?.subjects.map((subject) => {
                const percent =
                  subject.totalTasks > 0
                    ? Math.round((subject.completedTasks / subject.totalTasks) * 100)
                    : 0;
                const status = useProgressStatus(percent);
                const barClass =
                  status === "good"
                    ? "bg-emerald-500"
                    : status === "warning"
                      ? "bg-amber-400"
                      : "bg-rose-500";

                return (
                  <div
                    key={subject.subjectId}
                    className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {subject.subjectName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {subject.completedTasks} из {subject.totalTasks} заданий
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          status === "good"
                            ? "bg-emerald-50 text-emerald-700"
                            : status === "warning"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {status === "good"
                          ? "Всё хорошо"
                          : status === "warning"
                            ? "Зона внимания"
                            : "Критично"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={percent} className={`h-2 ${barClass}`} />
                      <span className="w-10 text-right text-xs font-medium text-slate-700">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">История сессий</CardTitle>
              <CardDescription>
                В MVP показываем только заглушку. Позже здесь появится детальная история занятий.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Раздел «История сессий» будет показывать недавние занятия: дату, предмет, режим и
                результат. Сейчас это заглушка без реальных данных.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

