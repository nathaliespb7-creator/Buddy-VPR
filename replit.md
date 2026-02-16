# My Training Buddy

## Overview
Empathic educational PWA for 4th grade Russian VPR (National Exams) preparation. Designed for 10-year-old children with a soothing, friendly interface that reduces exam stress.

## Recent Changes
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
- `Mascot.tsx` - SVG blob mascot with mood-based animations (idle, happy, thinking, celebrating, encouraging)
- `TaskCard.tsx` - Main quiz card with 3-tier hint system and answer validation
- `WelcomeScreen.tsx` - Entry point with greeting and discovery mission start
- `CategoryPicker.tsx` - Category selection after discovery (accent, phonetics, meaning)
- `CompletionScreen.tsx` - Results with star ratings per category
- `EmpathyToast.tsx` - Empathic feedback notifications
- `ProgressBar.tsx` - "My Superpowers" progress tracker

## Game Flow
1. Welcome screen → Start Discovery Mission
2. 3 diagnostic tasks (one from each category)
3. Category picker → Choose topic to practice
4. Training tasks → Complete all tasks
5. Completion screen with scores

## Database Tables
- `task_content` - VPR quiz tasks (accent, phonetics, meaning)
- `student_progress` - Per-task completion tracking
- `session_state` - Session-level state tracking

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
- Voice-first approach with `window.speechSynthesis`
- Large touch-friendly buttons (min 48px)
