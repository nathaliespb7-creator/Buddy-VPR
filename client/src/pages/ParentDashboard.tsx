import { useState } from "react";
import { useLocation } from "wouter";
import {
  BookOpen,
  CheckCircle,
  Star,
  Pencil,
  Mail,
  MessageSquare,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// ========== МОКОВЫЕ ДАННЫЕ — заменить на запросы к API / БД ==========
const mockData = {
  childName: "Маша",
  stats: {
    tasksCompleted: 127,
    correctPercent: 84,
    level: 5,
  },
  achievements: [
    { id: "1", emoji: "🏝️", title: "Остров «Орфография» пройден", date: "19 фев 2026" },
    { id: "2", emoji: "⭐", title: "Серия из 10 верных ответов", date: "18 фев 2026" },
    { id: "3", emoji: "📚", title: "Первый день в приложении", date: "15 фев 2026" },
  ],
  notifications: {
    emailReport: true,
    smsReminder: false,
  },
};

export default function ParentDashboard() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState(mockData.notifications);

  // Подставить реальные данные: например useQuery('/api/parent/profile') или props из роутера
  const childName = mockData.childName;
  const stats = mockData.stats;
  const achievements = mockData.achievements;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-6 pb-10 safe-bottom">
        {/* Кнопка «На главную» */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-2 text-muted-foreground hover:text-foreground" aria-label="На главную">
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Button>
        </div>
        {/* 1. Заголовок + кнопка редактирования профиля */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            Личный кабинет родителя {childName}
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => {
              // TODO: навигация на страницу редактирования профиля ребёнка или модальное окно
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Редактировать профиль
          </Button>
        </header>

        {/* 2. Основная статистика — Grid 3 колонки (mobile: 1, sm+: 3) */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="border-card-border bg-card">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Пройдено заданий
                </p>
                {/* TODO: подставить stats.tasksCompleted из API */}
                <p className="text-2xl font-bold text-foreground">
                  {stats.tasksCompleted}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border bg-card">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Верно решено
                </p>
                {/* TODO: подставить stats.correctPercent из API */}
                <p className="text-2xl font-bold text-foreground">
                  {stats.correctPercent}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border bg-card">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Текущий уровень
                </p>
                {/* TODO: подставить stats.level из API */}
                <p className="text-2xl font-bold text-foreground">
                  {stats.level}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 3. График активности — placeholder под Chart.js */}
        <section className="mb-6">
          <Card className="border-card-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Активность за неделю</CardTitle>
              <CardDescription>
                Количество решённых заданий по дням
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "flex min-h-[180px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground"
                )}
              >
                <p className="text-center text-sm">
                  Здесь будет график из Chart.js
                </p>
                {/* TODO: подключить react-chartjs-2 или recharts, данные с API (например /api/parent/activity) */}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Последние достижения */}
        <section className="mb-6">
          <Card className="border-card-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-primary" />
                Последние достижения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* TODO: подставить achievements из API, последние 3 */}
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5"
                >
                  <span className="text-2xl" role="img" aria-hidden>
                    {a.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* 5. Настройки уведомлений */}
        <section className="mb-6">
          <Card className="border-card-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Настройки уведомлений</CardTitle>
              <CardDescription>
                Выберите, как получать отчёты и напоминания
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="notify-email" className="cursor-pointer font-medium">
                    Отчёты на email
                  </Label>
                </div>
                <Switch
                  id="notify-email"
                  checked={notifications.emailReport}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, emailReport: checked }))
                  }
                  // TODO: сохранять в API (например PATCH /api/parent/notifications)
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="notify-sms" className="cursor-pointer font-medium">
                    Напоминания по SMS
                  </Label>
                </div>
                <Switch
                  id="notify-sms"
                  checked={notifications.smsReminder}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, smsReminder: checked }))
                  }
                  // TODO: сохранять в API
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 6. Кнопка действия */}
        <section>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
            onClick={() => {
              // TODO: навигация на подписку премиум или "Добавить ребёнка"
            }}
          >
            Подписаться на премиум
          </Button>
          {/* Альтернатива: "Добавить нового ребёнка" — раскомментировать при необходимости */}
          {/* <Button variant="outline" size="lg" className="mt-3 w-full">
            Добавить нового ребёнка
          </Button> */}
        </section>
      </div>
    </div>
  );
}
