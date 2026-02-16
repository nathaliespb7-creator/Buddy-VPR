# My Training Buddy

## Overview
Empathic educational PWA for 4th grade Russian VPR (National Exams) preparation. Designed for 10-year-old children with a soothing, friendly interface that reduces exam stress.

## Recent Changes
- Major redesign: Avatar picker (Cat/Robot/Astronaut), Power Card diagnostics, Island Map for training
- Canvas-confetti celebration at every 5th star
- Added 2 FIOKO VPR tasks: КВАРТАЛ (stress) and ВЬЮГА (sounds) — now 14 tasks total
- Star reward system: gold stars (first try, no hints), silver stars (with hints), 5-star level-up overlay
- Removed voice synthesis; redesigned Header with 5 visual star slots
- Initial build: Full MVP with soothing cloud theme, animated mascot, 3-tier hint system, 12 Russian VPR tasks, PostgreSQL persistence

## Architecture
- **Frontend**: React + Vite + TailwindCSS with Framer Motion animations
- **Backend**: Express.js with PostgreSQL via Drizzle ORM
- **Theme**: "Soothing Cloud" - soft mint, pastel blue, warm sand
- **Font**: Nunito (kid-friendly rounded font)

## Key Components
- `AvatarPicker.tsx` - First screen: "Who are you today?" with Cat/Robot/Astronaut cards
- `PowerCard.tsx` - "Your Power Card" showing diagnostic results per category as percentages
- `IslandMap.tsx` - Training mode map with 3 islands (Phonetics, Grammar, Text)
- `Mascot.tsx` - SVG blob mascot with mood-based animations (idle, happy, thinking, celebrating, encouraging)
- `TaskCard.tsx` - Main quiz card with 3-tier hint system and answer validation
- `CompletionScreen.tsx` - Results with star ratings per category
- `LevelUpOverlay.tsx` - Celebration overlay at every 5 stars with confetti
- `Header.tsx` - App header with 5 visual star slots (gold/silver/empty)
- `EmpathyToast.tsx` - Empathic feedback notifications
- `ProgressBar.tsx` - "My Superpowers" progress tracker

## Game Flow
1. Avatar picker → Choose Cat/Robot/Astronaut (saved to localStorage)
2. Diagnostic test: 3 tasks (one per category: accent, phonetics, meaning)
3. Power Card → Shows category percentages
4. Island Map → Choose training island (Phonetics/Grammar/Text/All)
5. Training tasks → Complete all tasks with star rewards
6. Completion screen → Back to island map

## Data Persistence
- `localStorage.buddy_profile` - Avatar choice, stars array, level
- `localStorage.buddy_session_id` - Session identifier
- PostgreSQL: task_content, student_progress, session_state tables

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
