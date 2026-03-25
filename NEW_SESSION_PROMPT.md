# New Session Starter — Slider Solution

Paste everything between the triple backticks as your first message in a new Claude Code session:

```
I am continuing development of slidersolution.com — a premium e-commerce site for Slider Cone Kit.

REPO: https://github.com/slidersolution420/Slider-Solution-Website
BRANCH: claude/create-github-repos-13yxl (all work is on this branch)

First, read these files in the repo:
1. HANDOFF.md — full project context and Wave 6 task list
2. PROGRESS.md — what has been built in each wave
3. src/lib/types.ts — all TypeScript interfaces
4. src/lib/currency.ts — pricing logic
5. src/lib/shipping.ts — shipping logic
6. src/store/index.ts — Zustand store shape

TECH STACK: Next.js 14 App Router, TypeScript strict, Tailwind CSS, next-intl (en/he/es + RTL), Framer Motion, Zustand, Supabase (Postgres + Auth + RLS), Hype API (payments), Tapuz API (SOAP delivery), Resend (emails), Vercel, Cloudinary, PostHog, Sentry.

ABSOLUTE ARCHITECTURE RULES — NEVER VIOLATE:
- lib/hype.ts — ALL Hype logic only
- lib/tapuz.ts — ALL Tapuz logic only
- lib/currency.ts — ALL currency logic, zero hardcoded prices
- lib/shipping.ts — ALL shipping logic, zero hardcoded costs
- lib/analytics.ts — ALL PostHog calls only
- lib/resend.ts — ALL email sends only
- lib/supabase.ts — browser Supabase client only
- lib/supabase-server.ts — RSC/server Supabase client only
- Zero hardcoded strings in JSX — always t() from next-intl
- Zero 'any' TypeScript types
- Conventional commits: feat/ fix/ chore/

CURRENT STATUS: Waves 0–5 complete. Wave 6 in progress.

SUPABASE: project ref ecuhecmfxfavjdxuctkg — migrations applied, all tables live.
VERCEL: project prj_RdkSfiaYCx6z8neW0YOy0tqITW4b

After reading the files above, confirm you understand the project and then ask me which Wave 6 task to start with.
```
