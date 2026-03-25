# Slider Solution — slidersolution.com

E-commerce site for the **Slider Cone Kit**. B2C retail ($25/kit) + B2B wholesale ($82/display box).
Next.js 16, TypeScript, Tailwind CSS v4, Supabase.

## Commands

```bash
npm run dev        # Dev server → http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint v9 flat config
npm run type-check # TypeScript (noEmit)
```

## Stack

- **Next.js 16.2.1** — App Router, uses `proxy.ts` (not `middleware.ts`)
- **Tailwind CSS v4.2.2** — CSS-only config via `@theme {}` in `globals.css`, no `tailwind.config.ts`
- **next-intl v4** — `src/i18n/routing.ts` + `src/proxy.ts`. Locales: `he` (default, RTL), `en`
- **Keystatic CMS** — open-source, git-based, at `/keystatic`. Config: `keystatic.config.ts`
- **Zustand v5** — cart + UI state with persist middleware
- **Zod v4** + **react-hook-form v7** — form validation
- **ESLint v9** — flat config at `eslint.config.mjs`

## Architecture Rules (absolute — never violate)

| File | Owns |
|------|------|
| `lib/hype.ts` | ALL Hype payment logic |
| `lib/currency.ts` | ALL currency logic — zero hardcoded prices |
| `lib/shipping.ts` | ALL shipping cost logic |
| `lib/analytics.ts` | ALL PostHog calls — no `posthog.capture` in components |
| `lib/resend.ts` | ALL email sends (3 flows) |
| `lib/supabase.ts` | Browser Supabase client ONLY |
| `lib/supabase-server.ts` | Server/RSC Supabase client ONLY |
| `lib/keystatic.ts` | ALL Keystatic content reads |
| `lib/auth.ts` | Browser-safe auth (signUp/signIn/signOut) |
| `lib/auth-server.ts` | Server-only session check (`checkWholesaleSession`) |

**Additional rules:**
- Zero hardcoded strings in JSX — always `t()` from next-intl
- Zero `any` TypeScript types
- Conventional commits: `feat:` / `fix:` / `chore:`
- NEVER import from `supabase-server.ts` or `auth-server.ts` in Client Components

## Key Integrations

- **Supabase** (project ref: `ecuhecmfxfavjdxuctkg`) — Postgres + Auth + RLS
- **Supabase Storage** — `product-images` bucket (public) for product photos
- **Hype** — Payment gateway (webhook: `/api/checkout/webhook`)
- **Resend** — Email (order confirmation, contact, wholesale welcome)
- **Keystatic** — CMS (singletons: `siteSettings`, `product`; collections: `faq`, `pages`)
- **PostHog** — Analytics (optional)

## Content Structure

| Data | Source |
|------|--------|
| Product copy, features, FAQ, site settings | Keystatic (`content/` directory, git-tracked) |
| Orders | Supabase `orders` table |
| Wholesale accounts | Supabase `wholesale_accounts` + Auth |
| Reviews | Supabase `reviews` (moderated, `approved` boolean) |
| Product images | Supabase Storage `product-images` bucket |
| Policy pages | Keystatic `pages` collection (MDX) |

## Database Tables

`orders`, `wholesale_accounts`, `cart_sessions` (with `email` column), `reviews`

Migrations: `supabase/migrations/`

## i18n

2 locales: `he` (default, RTL), `en`. Translation files: `messages/{locale}.json`
- Hebrew: no URL prefix (e.g. `/`)
- English: `/en/` prefix

## Keystatic CMS

- Dev: accessible at `http://localhost:3000/keystatic` (local storage mode)
- Prod: requires `KEYSTATIC_GITHUB_CLIENT_ID` env var to enable GitHub storage mode
- Content files in `content/` directory are git-tracked JSON/YAML

## Env Vars

```
NEXT_PUBLIC_APP_URL=https://slidersolution.com
NEXT_PUBLIC_SUPABASE_URL=https://ecuhecmfxfavjdxuctkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
HYPE_API_KEY=...
HYPE_REFERER=https://slidersolution.com
HYPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=support@slidersolution.com
OWNER_ALERT_EMAIL=ceo@slidersolution.com
CRON_SECRET=...
KEYSTATIC_SECRET=...
KEYSTATIC_GITHUB_CLIENT_ID=...     (optional — enables GitHub CMS mode in prod)
KEYSTATIC_GITHUB_CLIENT_SECRET=... (optional)
```
