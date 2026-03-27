# Slider Solution — slidersolution.com

E-commerce site for the **Slider Cone Kit**. B2C retail ($25/kit) + B2B wholesale ($82/display box).
Next.js 16, TypeScript, Tailwind CSS v4, Supabase.

## Branch Rule

ALWAYS commit directly to `develop`. NEVER create `claude/*` branches or open PRs.
Push straight to `develop`. Merge `develop` → `main` only when explicitly asked.

## Commands

```bash
npm run dev        # Dev server → http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint v9 flat config
npm run type-check # TypeScript (noEmit)
```

## Stack

- **Next.js 16.2.1** — App Router, i18n middleware in `src/middleware.ts`
- **Tailwind CSS v4.2.2** — CSS-only config via `@theme {}` in `globals.css`, no `tailwind.config.ts`
- **next-intl v4** — `src/i18n/routing.ts` + `src/middleware.ts`. Locales: `he` (default, RTL), `en`
- **Keystatic CMS** — open-source, git-based, at `/keystatic`. Config: `keystatic.config.ts`
- **Zustand v5** — cart + UI state with persist middleware. Store export: `useStore` (NOT `useCartStore`) — destructure directly: `const { clearCart } = useStore()`
- **Zod v4** + **react-hook-form v7** — form validation
- **ESLint v9** — flat config at `eslint.config.mjs`

## Architecture Rules (absolute — never violate)

| File | Owns |
|------|------|
| `lib/hype.ts` | ALL Hype payment logic |
| `lib/currency.ts` | ALL currency logic — zero hardcoded prices |
| `lib/shipping.ts` | ALL shipping cost logic |
| `lib/config.ts` | ALL site config reads (prices, shipping, colors, reels, etc.) — replaces direct Keystatic singleton calls |
| `lib/analytics.ts` | ALL PostHog calls — no `posthog.capture` in components |
| `lib/resend.ts` | ALL email sends (3 flows) |
| `lib/supabase.ts` | Browser Supabase client ONLY |
| `lib/supabase-server.ts` | Server/RSC Supabase client ONLY |
| `lib/keystatic.ts` | ALL Keystatic content reads — static imports only, not `createReader` at runtime |
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
- **Hype** — Payment gateway. See Hype Payment Flow section below.
- **Resend** — Email (order confirmation, admin order alert, contact, wholesale welcome)
- **Keystatic** — CMS (singletons: `product`, `siteSettings`, `shippingSettings`; collections: `faq`, `pages`)
- **PostHog** — Analytics (optional)

## Hype Payment Flow

1. `POST /api/checkout` → `initiatePayment()` → `GET APISign?What=SIGN` → returns signed payment URL
2. Redirect user to `https://pay.hyp.co.il/p/?action=pay&<signed_params>`
3. User pays on Hype's hosted page
4. Hype redirects browser to `/thankyou` with params: `Id`, `CCode`, `Amount`, `ACode`, `Order`, `Sign`, …
5. `/thankyou` POSTs **all** redirect params to `POST /api/checkout/verify` → `verifyPayment()` → `GET APISign?What=VERIFY`
6. VERIFY returns `CCode=0` if genuine

**CRITICAL:** ALL redirect params (especially `Sign`) must be forwarded to VERIFY. Never trust `CCode=0` from the redirect URL alone — it can be forged. The `Sign` parameter is Hype's cryptographic signature and is the only real proof of payment.

## Admin

- Route: `/[locale]/admin`
- Auth: cookie `admin_auth` compared against `CRON_SECRET` env var. Login via `LoginForm` component.
- Tabs: חשבונות סיטונאי (wholesale accounts) | הזמנות (orders) | הגדרות תוכן (config) | ביקורות (reviews)
- API routes: `/api/admin/wholesale` (PATCH status), `/api/admin/reviews` (PATCH approved), `/api/admin/config` (PATCH any key), `/api/admin/logout` (POST)

## Content Structure

| Data | Source |
|------|--------|
| Product copy, features, FAQ, site settings | Keystatic (`content/` directory, git-tracked) |
| Site config (prices, shipping, colors, reels) | Supabase `config` table via `lib/config.ts` |
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

- Singletons: `product`, `siteSettings`, `shippingSettings`
- Collections: `faq`, `pages`
- All reads go through `lib/keystatic.ts` (static imports, not `createReader` at runtime)
- Dev: CMS UI at `http://localhost:3000/keystatic` (local storage mode)
- Prod: requires `KEYSTATIC_GITHUB_CLIENT_ID` env var to enable GitHub storage mode
- Content files in `content/` directory are git-tracked JSON/YAML

## Env Vars

```
NEXT_PUBLIC_APP_URL=https://slidersolution.com
NEXT_PUBLIC_SUPABASE_URL=https://ecuhecmfxfavjdxuctkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
HYPE_API_KEY=...                      # APIKey from Hype terminal settings
HYPE_PASSP=...                        # PassP authentication password from Hype terminal settings
HYPE_TERMINAL=...                     # 10-digit Masof terminal number from Hype terminal settings
RESEND_API_KEY=...
RESEND_FROM_EMAIL=support@slidersolution.com
OWNER_ALERT_EMAIL=ceo@slidersolution.com
CRON_SECRET=...                       # Used for admin auth cookie and cron route protection
KEYSTATIC_SECRET=...
KEYSTATIC_GITHUB_CLIENT_ID=...        (optional — enables GitHub CMS mode in prod)
KEYSTATIC_GITHUB_CLIENT_SECRET=...    (optional)
```
