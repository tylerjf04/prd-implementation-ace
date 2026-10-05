# NutriTrack

A full-stack nutrition and fitness tracking app that combines personalized macro planning, food logging, progress tracking, streaks, and a social accountability feed.

## Highlights

- Personalized calorie and macro targets based on user goals
- Food logging across breakfast, lunch, dinner, and snacks
- Weight and progress tracking
- Streak-based accountability system
- Social feed for progress posts and milestones
- Authentication and onboarding flow
- AI/chat-oriented interaction component
- Responsive, mobile-first interface

## Tech Stack

React 19, TypeScript, TanStack Start, TanStack Router, TanStack Query, Supabase, Tailwind CSS, Radix UI, Vite, and Cloudflare tooling.

## Product

NutriTrack is designed around a simple problem: traditional calorie trackers are useful, but consistency is difficult. The app combines nutrition tracking with streaks and social accountability so users have more reasons to keep coming back.

## Main Areas

- `/onboarding` — personalized setup and goal configuration
- `/app` — daily nutrition dashboard
- `/app/log` — food logging
- `/app/weight` — weight tracking
- `/app/feed` — community feed
- `/app/messages` — messaging
- `/app/profile` — user profile

## Local Development

```bash
npm install
npm run dev
```

Create a local `.env` with the Supabase client configuration required by the app.

## Why I Built It

This project was an exercise in building a connected product rather than just a collection of pages: onboarding, state management, authentication, data persistence, responsive UI, and multiple product workflows all live in one application.
