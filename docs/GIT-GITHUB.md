# Доступ к GitHub: исправление 401 (Authentication failed)

Ошибка **401** / **Missing or invalid credentials** при `git push` означает, что GitHub не принимает текущие учётные данные. По HTTPS пароль аккаунта больше **нельзя** использовать — нужен токен или SSH.

---

## Вариант 1: Personal Access Token (HTTPS)

1. Зайди на **https://github.com** → **Settings** (твой профиль) → внизу слева **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
2. **Generate new token (classic)**. Название, например: `Buddy-VPR push`.
3. Срок действия выбери (30/60/90 дней или No expiration).
4. Отметь право **repo** (полный доступ к репозиториям).
5. Нажми **Generate token**, **скопируй токен** (показывается один раз).
6. В терминале выполни:
   ```bash
   cd /Users/nathalie/Buddy-VPR
   git push -u origin main
   ```
7. Когда запросит **Username**: введи свой логин GitHub (например `nathaliespb7-creator`).
8. Когда запросит **Password**: вставь **токен** (не пароль от аккаунта).
9. Чтобы macOS запомнил учётные данные: **Системные настройки** → **Пароли** (или Keychain Access) — там появится запись для `github.com`; можно оставить как есть.

Если Cursor/терминал не спрашивает логин/пароль и снова даёт 401 — один раз задать URL с токеном (подставь `ТВОЙ_ТОКЕН` и свой логин):

```bash
git remote set-url origin https://ЛОГИН:ТВОЙ_ТОКЕН@github.com/nathaliespb7-creator/Buddy-VPR.git
git push -u origin main
```

После успешного push лучше убрать токен из URL (чтобы он не светился в конфиге):

```bash
git remote set-url origin https://github.com/nathaliespb7-creator/Buddy-VPR.git
```

Дальше push будет использовать сохранённые в системе учётные данные.

### Если не получается вставить токен в терминал

В Cursor вставка в терминал может не работать. Сохрани токен в файл (в редакторе вставка работает), затем выполни команды:

1. **Отзови старый токен** на GitHub (если он попадал в чат или в вывод терминала): **Settings** → **Developer settings** → **Personal access tokens** → напротив токена **Revoke**. Создай новый токен.
2. В проекте Buddy-VPR создай файл **`.github-token-buddy`** (он уже в `.gitignore`, в репозиторий не попадёт).
3. Открой этот файл в Cursor и **вставь в него только токен** — одна строка, без пробелов и кавычек. Сохрани файл.
4. В терминале выполни (подставь свой логин, если не `nathaliespb7-creator`):

   ```bash
   cd /Users/nathalie/Buddy-VPR
   git remote set-url origin "https://nathaliespb7-creator:$(cat .github-token-buddy)@github.com/nathaliespb7-creator/Buddy-VPR.git"
   git push -u origin main
   ```

5. После успешного push убери токен из URL и удали файл:

   ```bash
   git remote set-url origin https://github.com/nathaliespb7-creator/Buddy-VPR.git
   rm .github-token-buddy
   ```

---

## Вариант 2: SSH (удобно на долгий срок)

1. Проверь, есть ли ключ:
   ```bash
   ls -la ~/.ssh/id_ed25519.pub
   ```
   или `~/.ssh/id_rsa.pub`. Если файла нет — создай ключ:
   ```bash
   ssh-keygen -t ed25519 -C "твой@email" -f ~/.ssh/id_ed25519 -N ""
   ```
2. Скопируй **публичный** ключ в буфер:
   ```bash
   pbcopy < ~/.ssh/id_ed25519.pub
   ```
   (или открой `~/.ssh/id_ed25519.pub` и скопируй вручную).
3. На GitHub: **Settings** → **SSH and GPG keys** → **New SSH key** → вставь ключ, сохрани.
4. В папке проекта переключи remote на SSH и запушь:
   ```bash
   cd /Users/nathalie/Buddy-VPR
   git remote set-url origin git@github.com:nathaliespb7-creator/Buddy-VPR.git
   git push -u origin main
   ```

При первом подключении может спросить про fingerprint — введи `yes`.

---

## После успешного push

- Vercel автоматически подхватит новый коммит и задеплоит проект.
- Проверь сайт: https://www.buddyvpr.ru и https://buddyvpr.ru.

Репозиторий: **https://github.com/nathaliespb7-creator/Buddy-VPR**
