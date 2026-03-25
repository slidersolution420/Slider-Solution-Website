# Slider Solution — slidersolution.com

E-commerce site for the **Slider Cone Kit**. B2C retail ($25/kit) + B2B wholesale ($82/display box). Next.js 14, TypeScript, Tailwind, Supabase.

## Commands

```bash
npm run dev        # Dev server → http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npm run type-check # TypeScript (noEmit)
```

## Architecture Rules (absolute — never violate)

| File | Owns |
|------|------|
| `lib/hype.ts` | ALL Hype payment logic |
| `lib/tapuz.ts` | ALL Tapuz delivery logic (SOAP) |
| `lib/currency.ts` | ALL currency logic — zero hardcoded prices |
| `lib/shipping.ts` | ALL shipping cost logic |
| `lib/analytics.ts` | ALL PostHog calls — no `posthog.capture` in components |
| `lib/resend.ts` | ALL email sends (7 flows) |
| `lib/supabase.ts` | Browser Supabase client only |
| `lib/supabase-server.ts` | Server/RSC Supabase client only |
| `lib/cloudinary.ts` | ALL Cloudinary image logic |

**Additional rules:**
- Zero hardcoded strings in JSX — always `t()` from next-intl
- Zero `any` TypeScript types
- Conventional commits: `feat:` / `fix:` / `chore:`

## Key Integrations

- **Supabase** (project ref: `ecuhecmfxfavjdxuctkg`) — Postgres + Auth + RLS
- **Hype** — Payment gateway (webhook: `/api/checkout/webhook`)
- **Tapuz** — SOAP shipping API (test mode: customer code `4041`)
- **Resend** — 7 automated email flows
- **Cloudinary** — Product image optimization
- **PostHog** — Analytics (optional)

## Database Tables

`products`, `orders`, `wholesale_accounts`, `cart_sessions`, `reviews`

Migrations: `supabase/migrations/` | Seed: `supabase/seed.sql`

## i18n

3 locales: `en`, `he` (RTL), `es`. Translation files: `messages/{locale}.json`

## Env Vars

See `.env.example` for all required variables. Key ones:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `HYPE_API_KEY`, `HYPE_REFERER`, `HYPE_WEBHOOK_SECRET`
- `TAPUZ_CUSTOMER_CODE`, `TAPUZ_USERNAME`, `TAPUZ_PASSWORD`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `OWNER_ALERT_EMAIL`
- `CRON_SECRET`
