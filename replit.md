# ВПР Бадди

## Overview
Empathic educational PWA for 4th grade Russian VPR (National Exams) preparation. Designed for 10-year-old children with a soothing, friendly interface that reduces exam stress. Branded as "ВПР Бадди" — a supportive partner character.

## Recent Changes
- **Methodology-based hints**: Each golden rule has hints for 3 methodologies (school_of_russia, zankov, elkonin) + default fallback
- **getBuddyHint(ruleId)**: Returns methodology-specific hint text, used in TaskCard level 3 hints and voice assistant
- **Voice assistant**: "Послушай" button using window.speechSynthesis (Russian, rate 0.9), reads audio/hint/rule based on context
- **PWA offline**: Service Worker (sw.js) caches assets for offline use
- **Branding**: Updated manifest.json, index.html to "ВПР Бадди"
- **Mascot**: Transparent PNG, gentle animations (no anxious shaking)
- **Splash screen**: Loading screen with animated Buddy mascot, progress bar, "ВПР Бадди" branding
- Knowledge Tree: 20 golden rules database, 33 tasks across 6 categories
- Star reward system: gold stars (first try), silver stars (with hints), 5-star level-up overlay

## Architecture
- **Frontend**: React + Vite + TailwindCSS with Framer Motion animations
- **Backend**: Express.js with PostgreSQL via Drizzle ORM
- **Theme**: "Soothing Cloud" - soft mint, pastel green, warm sand
- **Font**: Nunito (kid-friendly rounded font)
- **Knowledge Tree**: 4 clusters (Phonetics/Orthoepy, Morphemics, Morphology, Syntax) + 2 extra (Accent, Meaning)

## Key Components
- `SplashScreen.tsx` - Loading screen with animated Buddy, progress bar, "ВПР Бадди" title
- `AvatarPicker.tsx` - "Привет, напарник!" screen with Cat/Robot/Astronaut cards
- `PowerCard.tsx` - "Твоя карта силы" showing diagnostic results per category
- `IslandMap.tsx` - Training map with 6 islands + "Все острова"
- `Mascot.tsx` - SVG round green mascot with headphones, mic, book; mood animations; props: isSpeaking, bookOpen
- `TaskCard.tsx` - Main quiz card with 3-tier hint system ("Бадди подсказывает", "Секретная подсказка", "Золотое правило")
- `CompletionScreen.tsx` - Results with ВПР Бадди personality messages
- `LevelUpOverlay.tsx` - "Вот это мощь!" celebration at every 5 stars
- `Header.tsx` - "ВПР Бадди" header with star slots
- `EmpathyToast.tsx` - Empathic feedback with mascot
- `ProgressBar.tsx` - "Наш прогресс" tracker

## Mascot Details
- **Body**: Circle, mint-green radial gradient (#D4F5E0 → #9EDCB0)
- **Headphones**: Dark navy (#3D5A80) band over head, ear cups on sides
- **Mic**: Boom mic from left ear cup, vibrates (CSS `buddy-mic-speaking`) when `isSpeaking=true`
- **Book**: Orange book held in right hand, opens wider when `bookOpen=true` (rotate transition)
- **Eyes**: White sclera circles with dark pupils, follow cursor, blink every 5s
- **Moods**: idle, happy, thinking, celebrating, encouraging, wrong, hint
- **Sizes**: sm (16), md (24), lg (32), xl (48)

## Game Flow
1. Splash screen → Animated Buddy loading
2. Avatar picker → Choose Cat/Robot/Astronaut (saved to localStorage)
3. Diagnostic test: 3 random tasks from different categories
4. Power Card → Shows category percentages
5. Island Map → Choose training island (6 islands + All)
6. Training tasks → Complete with star rewards, Бадди hints on mistakes
7. Completion screen → Back to island map

## ВПР Бадди Personality
- **Style**: Friendly, supportive, modern (no slang)
- **Address**: User as "напарник" (partner) or "герой" (hero)
- **Auto-reactions**: Short phrases (up to 4 words): "Так держать, герой!", "Верный путь!", "Вот это сила!"
- **Cat avatar prefix**: none (no prefix)
- **Robot avatar prefix**: "Бип-боп! " before toast messages
- **Wrong answer**: "Не переживай, напарник! Мы разберёмся вместе!"
- **Hints**: "Бадди подсказывает" → "Секретная подсказка" → "Золотое правило"

## Data: 20 Golden Rules
Each task links to a golden rule via ruleId. Rules cover all VPR topics.

## Categories (6)
- `accent` - Ударения (Орфоэпия)
- `phonetics` - Звуки и буквы (Фонетика)
- `morphemics` - Состав слова (Морфемика)
- `morphology` - Части речи (Морфология)
- `syntax` - Предложение (Синтаксис и Пунктуация)
- `meaning` - Смысл и пословицы (Текст)

## Data Persistence
- `localStorage.buddy_profile` - Avatar choice, stars array, level
- `localStorage.buddy_session_id` - Session identifier
- PostgreSQL: task_content (33 tasks), student_progress, session_state tables

## API Routes
- `GET /api/tasks` - All tasks
- `GET /api/tasks/:category` - Tasks by category
- `POST /api/progress` - Save task progress
- `GET /api/progress/:sessionId` - Get session progress
- `GET /api/session/:sessionId` - Get/create session
- `PUT /api/session/:sessionId` - Update session

## User Preferences
- Target audience: Russian-speaking children (age 10)
- No "red for error" - uses orange for "try again", green for success
- No voice synthesis (Yandex SpeechKit planned for future)
- Large touch-friendly buttons (min 48px)
- Mobile-first, pastel colors
