# ВПР Бадди

## Overview
Empathic educational PWA for 4th grade Russian VPR (National Exams) preparation. Designed for 10-year-old children with a soothing, friendly interface that reduces exam stress. Branded as "ВПР Бадди" — a supportive partner character.

## Recent Changes
- **Round-based spaced repetition**: Full mastery loop — student goes through all tasks in a category (Round 1), mistakes repeat in Round 2+, until 0 errors
- **Persistent progress**: Progress saved in PostgreSQL (category_rounds + round_task_results tables). Student can stop mid-round and resume later
- **Island map progress**: Each island shows current round number, completion %, and correct/wrong counts
- **Completion screen**: Shows wrong words list, offers "Next round" button to practice only mistakes
- **Mastery detection**: When all words answered correctly, category marked as "Освоено!"
- **Header star counter**: Shows cumulative gold (first attempt) and silver (with hints) star counts
- **Idempotent answer submission**: Duplicate submissions don't inflate counts
- Previous: Methodology-based hints, voice assistant, PWA offline, splash screen, 22 golden rules, 175+ tasks

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
- PostgreSQL tables: task_content (175+ tasks), student_progress, session_state, category_rounds, round_task_results

## API Routes
- `GET /api/tasks` - All tasks
- `GET /api/tasks/:category` - Tasks by category
- `POST /api/progress` - Save task progress (legacy)
- `GET /api/progress/:sessionId` - Get session progress (legacy)
- `GET /api/session/:sessionId` - Get/create session
- `PUT /api/session/:sessionId` - Update session
- `GET /api/round/:category?sessionId=X` - Get/create active round for category
- `POST /api/round/:category/answer` - Submit answer {sessionId, taskId, correctFirstAttempt, attempts}
- `GET /api/round/:category/summary?sessionId=X` - Get round summary with wrong words
- `GET /api/categories/progress?sessionId=X` - Get all category progress summaries

## Game Flow
1. Splash screen -> Animated Buddy loading
2. Avatar picker -> Choose Cat/Robot/Astronaut (saved to localStorage)
3. Diagnostic test: 3 random tasks from different categories
4. Power Card -> Shows category percentages
5. Island Map -> Choose training island (shows round progress per category)
6. Training tasks -> Round-based: all tasks in category = Round 1
7. Completion screen -> Shows correct/wrong counts, wrong words list
8. If errors exist -> "Next round" button starts Round N+1 with only wrong words
9. Repeat until mastery (0 errors) -> "Освоено!" badge on island map

## User Preferences
- Target audience: Russian-speaking children (age 10)
- No "red for error" - uses orange for "try again", green for success
- No voice synthesis (Yandex SpeechKit planned for future)
- Large touch-friendly buttons (min 48px)
- Mobile-first, pastel colors
