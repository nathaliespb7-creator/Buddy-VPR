import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const handleStart = () => {
    setLocation("/class-selector");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 shadow-sm">
          Добро пожаловать в Бадди ВПР
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Привет! Я Бадди! 🎉
        </h1>

        <p className="max-w-xl text-base text-slate-600 sm:text-lg">
          Это <strong>умный тренажёр для подготовки к ВПР</strong> по{" "}
          <strong>русскому языку</strong>, <strong>математике</strong> и{" "}
          <strong>окружающему миру</strong>. Здесь ты сможешь эффективно
          повторять темы, решать задания и видеть свой прогресс. Давай начнём
          подготовку к ВПР и усилим твои знания и результат? ✨
        </p>

        <div className="mt-4 flex flex-col items-center gap-3">
          <Button
            size="lg"
            className="min-w-[220px] min-h-[52px] rounded-full bg-emerald-500 text-base font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600"
            onClick={handleStart}
          >
            Выбери класс
          </Button>
          <p className="text-xs text-slate-500">
            Шаг 1: выбери класс — дальше тебя проведёт Бадди.
          </p>
        </div>
      </div>
    </main>
  );
}

