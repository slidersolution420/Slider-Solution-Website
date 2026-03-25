# Slider Solution — slidersolution.com

Premium e-commerce site for the **Slider Cone Kit**, a patent-protected all-in-one cannabis accessory. Supports B2C retail and B2B wholesale, multilingual (EN/HE/ES with RTL), international shipping, and automated email flows.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS (dark theme) |
| i18n | next-intl (en, he, es + RTL) |
| Animations | Framer Motion |
| State | Zustand (persisted cart & currency) |
| Database | Supabase (Postgres + Auth + RLS) |
| Payments | Hype API |
| Delivery | Tapuz API (SOAP) |
| Email | Resend (7 automated flows) |
| Hosting | Vercel |
| Images | Cloudinary |
| Analytics | PostHog |
| Errors | Sentry |
| Icons | @heroicons/react |

## Local Development

```bash
# 1. Clone and install
git clone https://github.com/slidersolution420/Slider-Solution-Website.git
cd Slider-Solution-Website
npm install

# 2. Environment variables
cp .env.example .env.local
# Fill in all values — see Environment Variables section below

# 3. Run dev server
npm run dev        # http://localhost:3000

# 4. Other commands
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier
npm run type-check # TypeScript check
```

### Supabase Setup

```bash
# Link to project
npx supabase link --project-ref ecuhecmfxfavjdxuctkg

# Apply migrations (already applied in production)
npx supabase db push

# Seed data
npx supabase db seed
```

## Architecture Rules

These rules are **absolute** — never violate them:

| File | Rule |
|------|------|
| `lib/hype.ts` | ALL Hype payment logic only |
| `lib/tapuz.ts` | ALL Tapuz delivery logic only |
| `lib/currency.ts` | ALL currency logic — zero hardcoded prices anywhere |
| `lib/shipping.ts` | ALL shipping logic — zero hardcoded costs anywhere |
| `lib/analytics.ts` | ALL PostHog calls only — no `posthog.capture` in components |
| `lib/resend.ts` | ALL email sends only |
| `lib/supabase.ts` | Browser Supabase client only |
| `lib/supabase-server.ts` | RSC/server Supabase client only |
| `lib/cloudinary.ts` | ALL Cloudinary image logic only |

Additional rules:
- Zero hardcoded strings in JSX — always `t()` from next-intl
- Zero `any` TypeScript types
- Conventional commits: `feat:` / `fix:` / `chore:`

## Wave History

| Wave | Scope | Status |
|------|-------|--------|
| 0 | Project foundation — Next.js, Tailwind, Supabase schema, i18n, Zustand | Complete |
| 1 | B2C shell — homepage, product hero, cart, color swatches, sticky bar | Complete |
| 2 | Checkout + Hype payment integration | Complete |
| 3 | Tapuz delivery stub + 7 Resend email flows + post-purchase automation | Complete |
| 4 | B2B wholesale portal — modal, auth, dashboard | Complete |
| 5 | Polish — age gate, exit intent, trust bar, SEO, RTL fixes | Complete |
| 6 | Launch preparation — real Tapuz SOAP, Cloudinary, seed data, QA checklist | Complete |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | Production URL (https://slidersolution.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `HYPE_API_KEY` | Yes | Hype payment gateway API key |
| `HYPE_REFERER` | Yes | Hype referer header value |
| `HYPE_WEBHOOK_SECRET` | No | Hype webhook signature secret |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `RESEND_FROM_EMAIL` | Yes | Sender email (support@slidersolution.com) |
| `OWNER_ALERT_EMAIL` | Yes | Owner notification email |
| `TAPUZ_CUSTOMER_CODE` | Yes | Tapuz customer code (4041 = test) |
| `TAPUZ_USERNAME` | Yes | Tapuz API username |
| `TAPUZ_PASSWORD` | Yes | Tapuz API password |
| `CRON_SECRET` | Yes | Secret for cron job endpoints |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project API key |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for error tracking |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |

## Key URLs

| Service | URL |
|---------|-----|
| Production | https://slidersolution.com (pending DNS cutover) |
| Vercel | Project `prj_RdkSfiaYCx6z8neW0YOy0tqITW4b` |
| Supabase | Project `ecuhecmfxfavjdxuctkg` |

## Database Tables

- `products` — B2C kits (black/blue/purple @ $25) + B2B display box ($82)
- `orders` — All orders with payment and shipping status
- `wholesale_accounts` — B2B partner accounts
- `cart_sessions` — Abandoned cart tracking
- `reviews` — Customer reviews with approval workflow

## License

Proprietary. All rights reserved.
