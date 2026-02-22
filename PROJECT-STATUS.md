# Статус проекта Бадди ВПР

## Команды деплоя (всегда здесь)

Деплой на Vercel запускается после **push** в GitHub. Выполняй в терминале:

```bash
cd /Users/nathalie/Buddy-VPR
git add .
git status
git commit -m "описание изменений"
git push
```

**Если 401 при push** (см. docs/GIT-GITHUB.md):

```bash
cd /Users/nathalie/Buddy-VPR
git remote set-url origin "https://nathaliespb7-creator:$(cat .github-token-buddy)@github.com/nathaliespb7-creator/Buddy-VPR.git"
git push -u origin main
git remote set-url origin https://github.com/nathaliespb7-creator/Buddy-VPR.git
```

**Проверка:** Vercel → проект Buddy-VPR → Deployments → статус **Ready**. Сайт: https://buddyvpr.vercel.app
