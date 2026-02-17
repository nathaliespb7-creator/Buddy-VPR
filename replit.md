# My Training Buddy

## Overview
Empathic educational PWA for 4th grade Russian VPR (National Exams) preparation. Designed for 10-year-old children with a soothing, friendly interface that reduces exam stress.

## Recent Changes
- Knowledge Tree: 20 golden rules database (Core 20 rules covering 90% VPR traps), magic hint RuleCard on mistakes
- Expanded to 6 categories: Accent, Phonetics, Morphemics, Morphology, Syntax, Meaning — 33 tasks total
- RuleCard component: slides up when child makes a mistake, shows linked golden rule with empathic hint
- Island Map expanded to 6 islands matching Knowledge Tree clusters
- Major redesign: Avatar picker (Cat/Robot/Astronaut), Power Card diagnostics, Island Map for training
- Canvas-confetti celebration at every 5th star
- Star reward system: gold stars (first try, no hints), silver stars (with hints), 5-star level-up overlay

## Architecture
- **Frontend**: React + Vite + TailwindCSS with Framer Motion animations
- **Backend**: Express.js with PostgreSQL via Drizzle ORM
- **Theme**: "Soothing Cloud" - soft mint, pastel blue, warm sand
- **Font**: Nunito (kid-friendly rounded font)
- **Knowledge Tree**: 4 clusters (Phonetics/Orthoepy, Morphemics, Morphology, Syntax) + 2 extra (Accent, Meaning)

## Key Components
- `AvatarPicker.tsx` - First screen: "Who are you today?" with Cat/Robot/Astronaut cards
- `PowerCard.tsx` - "Your Power Card" showing diagnostic results per category as percentages
- `IslandMap.tsx` - Training mode map with 6 islands (Accent, Phonetics, Morphemics, Morphology, Syntax, Meaning)
- `RuleCard.tsx` - Magic hint card that slides up on mistakes, shows linked golden rule
- `Mascot.tsx` - SVG blob mascot with mood-based animations (idle, happy, thinking, celebrating, encouraging)
- `TaskCard.tsx` - Main quiz card with 3-tier hint system, answer validation, and RuleCard integration
- `CompletionScreen.tsx` - Results with star ratings per category
- `LevelUpOverlay.tsx` - Celebration overlay at every 5 stars with confetti
- `Header.tsx` - App header with 5 visual star slots (gold/silver/empty)
- `EmpathyToast.tsx` - Empathic feedback notifications
- `ProgressBar.tsx` - "My Superpowers" progress tracker

## Game Flow
1. Avatar picker → Choose Cat/Robot/Astronaut (saved to localStorage)
2. Diagnostic test: 3 random tasks from different categories
3. Power Card → Shows category percentages
4. Island Map → Choose training island (6 islands + All)
5. Training tasks → Complete all tasks with star rewards, RuleCard on mistakes
6. Completion screen → Back to island map

## Data: 20 Golden Rules
Each task links to a golden rule via ruleId. When a child makes a mistake, the RuleCard shows the linked rule's topic and magic hint. Rules cover: безударные гласные, непроизносимые, ударения, главные члены, глагол, существительное, прилагательное, корень, приставка, суффикс, окончание, однородные члены, мягкий знак, предлоги/приставки, местоимения, спряжение, твёрдый знак, заглавная буква, перенос, основная мысль.

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
