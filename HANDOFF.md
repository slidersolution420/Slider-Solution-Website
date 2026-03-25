# Slider Solution — Session Handoff

> Last updated: Wave 6 in progress (March 2026)
> Branch: `claude/create-github-repos-13yxl`

---

## 1. Project Overview

Slider Solution is a premium direct-to-consumer e-commerce site for the **Slider Cone Kit** — a patent-protected all-in-one cannabis accessory (square grinder, wind-protected tray, funnel, and cones). The site sells B2C ($25/unit) in three colors (black, blue, purple) and B2B wholesale (Display Package: $82/box of 6 mixed). It ships worldwide with free shipping to Israel and on orders of 3+ units internationally. Built with Next.js 14 App Router, Tailwind, next-intl (English/Hebrew/Spanish + RTL), Supabase, Hype payments, Tapuz Express SOAP shipping, and Resend email. Deployed on Vercel.

---

## 2. Repository

- **GitHub:** https://github.com/slidersolution420/Slider-Solution-Website
- **Branch:** `claude/create-github-repos-13yxl` (all work goes here — never push to main without permission)
- **Vercel project:** `prj_RdkSfiaYCx6z8neW0YOy0tqITW4b`
- **Supabase project ref:** `ecuhecmfxfavjdxuctkg`

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14.2.35 (App Router) | `src/app/` directory |
| Language | TypeScript — strict mode | `noUncheckedIndexedAccess: true` |
| Styling | Tailwind CSS + globals.css | Design tokens in globals.css |
| i18n | next-intl | en/he/es, RTL support via `isRtl()` |
| Animation | Framer Motion | Used in hero, carousel, drawer |
| State | Zustand + localStorage persist | `src/store/index.ts` |
| Database | Supabase (Postgres + RLS) | 5 tables + edge functions |
| Auth | Supabase Auth (wholesale only) | `lib/auth.ts` |
| Payments | Hype API | `lib/hype.ts` |
| Shipping | Tapuz Express (SOAP) | `lib/tapuz.ts` |
| Email | Resend | `lib/resend.ts` — 7 templates |
| Images | Cloudinary | `lib/cloudinary.ts` |
| Analytics | PostHog | `lib/analytics.ts` — 7 events |
| Monitoring | Sentry `@sentry/nextjs` v10 | `sentry.client.config.ts`, `sentry.server.config.ts` |
| Deployment | Vercel | Auto-deploy on push to branch |
| Forms | react-hook-form + Zod | `lib/schemas.ts` |

---

## 4. Absolute Architecture Rules — Never Violate

1. **`lib/hype.ts`** — ALL Hype payment logic lives here only. Zero payment logic elsewhere.
2. **`lib/tapuz.ts`** — ALL Tapuz shipping/SOAP logic lives here only.
3. **`lib/currency.ts`** — ALL currency logic. Zero hardcoded prices anywhere in the codebase.
4. **`lib/shipping.ts`** — ALL shipping cost logic. Zero hardcoded shipping costs elsewhere.
5. **`lib/analytics.ts`** — ALL PostHog event calls. Zero `posthog.capture()` calls outside this file.
6. **`lib/resend.ts`** — ALL email sends. Zero `resend.emails.send()` outside this file.
7. **`lib/supabase.ts`** — Browser/client Supabase client only (used in Client Components).
8. **`lib/supabase-server.ts`** — Server Supabase client only (RSC, Server Actions, Route Handlers).
9. **Zero hardcoded strings in JSX** — always use `t()` from next-intl. All 3 locale files must stay in sync.
10. **Zero `any` TypeScript types** — use `unknown` and narrow, or define proper interfaces in `lib/types.ts`.
11. **Conventional commits** — `feat:`, `fix:`, `chore:`, `docs:` prefixes.
12. **No new files unless necessary** — prefer editing existing files.
13. **RTL-safe CSS** — use logical properties: `end-0` not `right-0`, `border-s` not `border-l`, `ms-` not `ml-` etc.

---

## 5. Environment Variables

All variables are set in Vercel. Local dev uses `.env.local`. See `.env.example` for full list with comments.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, never expose to browser) |
| `NEXT_PUBLIC_APP_URL` | Full app URL — `https://slidersolution.com` in prod, `http://localhost:3000` in dev. **Owner must add this to Vercel.** |
| `HYPE_API_KEY` | Hype payment gateway API key |
| `HYPE_REFERER` | Hype referer ID |
| `HYPE_WEBHOOK_SECRET` | HMAC secret for verifying Hype webhooks |
| `TAPUZ_CUSTOMER_CODE` | Tapuz Express customer code. Value `4041` = test/mock mode. **Pending from Guy (guy.g@tapuzdelivery.co.il).** |
| `TAPUZ_SENDER_CODE` | Tapuz sender/pickup code (defaults to customer code if unset) |
| `RESEND_API_KEY` | Resend email API key |
| `RESEND_FROM_EMAIL` | From address: `support@slidersolution.com` |
| `OWNER_ALERT_EMAIL` | Gets B2B signup alert emails |
| `CRON_SECRET` | Protects cron-triggered API routes |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (default: `https://app.posthog.com`) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name. If `placeholder` or unset → gradient fallback shown. **Owner must upload images and set this.** |
| `SHOW_GUARANTEE` | `true`/`false` — shows money-back guarantee badge |
| `ENABLE_EXIT_POPUP` | `true`/`false` — enables exit intent popup |
| `ENABLE_REORDER_EMAIL` | `true`/`false` — enables Day+30 B2B reorder email |
| `SHIPPING_CUTOFF_HOUR` | Integer (24h Israel time) — before this hour shows "Shipping today" |

---

## 6. Wave Completion Status

| Wave | Name | Status |
|---|---|---|
| 0 | Foundation | ✅ Complete |
| 1 | B2C Shell | ✅ Complete |
| 2 | Checkout + Hype Payments | ✅ Complete |
| 3 | Delivery + Email | ✅ Complete |
| 4 | B2B Wholesale Portal | ✅ Complete |
| 5 | Polish (RTL, SEO, A11y, Perf, Monitoring) | ✅ Complete |
| 6 | Launch | 🚧 In Progress |

---

## 7. Wave 6 — Remaining Tasks

The following tasks from Wave 6 are **still to complete** as of this handoff:

### TASK 1 — Cloudinary images (partial)
- `lib/cloudinary.ts` ✅ Done — `PRODUCT_IMAGES` map + `COLOR_GRADIENTS` + updated `cloudinaryUrl()`
- `ProductHero.tsx` ✅ Done — uses `cloudinaryUrl()` with gradient fallback
- `BuyNowB2B.tsx` ⏳ Still needs: wire up `cloudinaryUrl(PRODUCT_IMAGES['display-front'])` with gradient fallback for the B2B product image area
- `KitFeatures.tsx` — check if images needed (currently uses Heroicons, may not need Cloudinary)

### TASK 2 — OG image + favicon
- `public/og-image.jpg` ✅ Done (minimal valid dark JPEG placeholder, 332 bytes)
- `public/favicon.ico` ✅ Done (minimal valid 16×16 dark ICO, 198 bytes)
- Owner action: replace with real branded images before launch

### TASK 3 — Supabase seed
- `supabase/seed.sql` ✅ Done — 5 reviews + 4 products with `ON CONFLICT DO NOTHING`

### TASK 4 — ReviewsCarousel + /reviews page Supabase
- `ReviewsCarousel.tsx` ✅ Done — accepts `reviews: ReviewItem[]` prop
- `page.tsx` (home) ✅ Done — server-fetches approved reviews, passes to carousel
- `reviews/page.tsx` ✅ Done — server-fetches all approved reviews, full grid display

### TASK 5 — Tapuz SOAP
- `lib/tapuz.ts` ✅ Done — real SOAP `SaveData1` with pipe-delimited params, `<DeliveryNumber>` parsing, mock when `TAPUZ_CUSTOMER_CODE` unset or `4041`
- `api/delivery/route.ts` ✅ Done — stores `tapuz_tracking_url` in orders table

### TASK 6 — NEXT_PUBLIC_APP_URL instructions ⏳ Pending
Owner must set `NEXT_PUBLIC_APP_URL=https://slidersolution.com` in Vercel:
1. Go to https://vercel.com → Project `prj_RdkSfiaYCx6z8neW0YOy0tqITW4b` → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_APP_URL` = `https://slidersolution.com` (all environments)
3. Redeploy

### TASK 7 — Admin QA page ⏳ Pending
Create `src/app/[locale]/admin/qa/page.tsx` — server component with pre-launch QA checklist:
- B2C flow: age gate → product select → add to cart → checkout → payment → success page → email
- B2B flow: wholesale modal → register/login → B2B product → checkout
- Language/RTL: switch to Hebrew → verify RTL layout → CartDrawer opens from left
- Mobile: test all breakpoints
- Technical: robots.txt, sitemap.xml, OG tags, JSON-LD, CSP headers, Sentry test error

### TASK 8 — README.md ⏳ Pending
Full rewrite of `README.md` with:
- Project overview and tech stack
- Local setup instructions (`npm install`, `.env.local` setup, `supabase start`, `npm run dev`)
- Supabase migration instructions
- Wave history summary
- Key contacts and URLs
- Architecture rules summary

---

## 8. Key Product & Business Decisions (Already Made — Do Not Change)

| Decision | Value |
|---|---|
| B2C price | $25 USD per kit (all colors) |
| B2B box price | $82 USD per display box (6 kits: 2 black, 2 blue, 2 purple) |
| B2C colors | black, blue, purple (+ "mixed" for B2B cart items) |
| Free shipping | Israel: always free. International: free on 3+ units |
| International shipping | $25 flat rate, 7–21 days |
| Wholesale auth | Supabase Auth — username/password, accounts manually approved |
| Currency | USD, EUR, ILS (display only — all transactions in USD) |
| Locales | en (default), he (Hebrew/RTL), es (Spanish) |
| Age gate | 21+ check, localStorage persisted |
| Payment | Hype API (Israeli payment gateway) |
| Delivery | Tapuz Express (Israeli courier, SOAP API) |

---

## 9. Key File Structure

```
Slider-Solution-Website/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx          # Root locale layout, PostHogProvider, NextIntlClientProvider
│   │   │   ├── page.tsx            # Home page (server, fetches reviews)
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx        # Checkout form (client, Hype payment)
│   │   │   ├── order/[id]/
│   │   │   │   ├── page.tsx        # Order success page (server)
│   │   │   │   └── PurchaseTracker.tsx  # Client — fires trackPurchase once
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx        # All reviews page (server, Supabase)
│   │   │   ├── wholesale/
│   │   │   │   └── page.tsx        # B2B dashboard (server, RLS-protected)
│   │   │   └── admin/
│   │   │       └── qa/
│   │   │           └── page.tsx    # ⏳ Pre-launch QA checklist (to create)
│   │   ├── api/
│   │   │   ├── checkout/
│   │   │   │   ├── route.ts        # POST — initiates Hype payment session
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts    # POST — Hype webhook → creates order in Supabase
│   │   │   ├── delivery/
│   │   │   │   └── route.ts        # POST — creates Tapuz shipment, updates order
│   │   │   └── email/
│   │   │       ├── abandoned-cart/route.ts
│   │   │       ├── post-purchase/route.ts
│   │   │       └── wholesale-signup/route.ts
│   │   ├── robots.txt/
│   │   │   └── route.ts            # GET — returns robots.txt content
│   │   ├── sitemap.ts              # generateSitemap for all locales
│   │   └── layout.tsx              # Root app layout (metadataBase)
│   ├── components/
│   │   ├── analytics/
│   │   │   └── PostHogProvider.tsx # Client — initializes PostHog
│   │   ├── checkout/
│   │   │   └── CartDrawer.tsx      # RTL-aware, focus trap, role=dialog
│   │   ├── product/
│   │   │   ├── ProductHero.tsx     # Hero with Cloudinary image + gradient fallback
│   │   │   ├── BuyNowSection.tsx   # B2C add to cart
│   │   │   ├── ColorSwatch.tsx     # role=radiogroup/radio, keyboard nav
│   │   │   ├── QuantitySelector.tsx # role=radiogroup/radio, 3-card layout
│   │   │   ├── KitFeatures.tsx     # Feature icons grid
│   │   │   └── HowItWorks.tsx      # 3-step instructions
│   │   ├── ui/
│   │   │   ├── AgeGate.tsx         # role=dialog, focus trap, 21+ check
│   │   │   ├── NavBar.tsx          # LanguageSwitcher, CurrencySwitcher
│   │   │   ├── ReviewsCarousel.tsx # Client carousel, accepts reviews prop
│   │   │   ├── TickerBar.tsx       # RTL-reversed marquee
│   │   │   ├── StickyCartBar.tsx   # Sticky mobile CTA
│   │   │   ├── ExitIntentPopup.tsx
│   │   │   ├── TrustBar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CurrencySwitcher.tsx
│   │   │   └── LanguageSwitcher.tsx
│   │   └── wholesale/
│   │       ├── BuyNowB2B.tsx       # B2B product card + qty stepper
│   │       ├── WholesaleModal.tsx  # 2-tab login/register, role=dialog, focus trap
│   │       └── WholesaleSessionRestorer.tsx
│   ├── hooks/
│   │   └── useInView.ts
│   ├── lib/
│   │   ├── analytics.ts            # 7 PostHog events (positional args)
│   │   ├── auth.ts                 # Wholesale Supabase auth
│   │   ├── cloudinary.ts           # cloudinaryUrl(), PRODUCT_IMAGES, COLOR_GRADIENTS
│   │   ├── countries.ts            # SUPPORTED_COUNTRIES array
│   │   ├── currency.ts             # formatPrice, B2C_PRICE_USD=25, B2B_BOX_PRICE_USD=82
│   │   ├── hype.ts                 # initiatePayment, verifyWebhookSignature
│   │   ├── resend.ts               # 7 email templates
│   │   ├── schemas.ts              # Zod schemas (checkoutSchema)
│   │   ├── shipping.ts             # getShippingCost, getShippingMessage
│   │   ├── supabase.ts             # Browser client
│   │   ├── supabase-server.ts      # createClient() async, createServiceClient() sync
│   │   ├── tapuz.ts                # createShipment SOAP, getTrackingUrl, mock when code=4041
│   │   └── types.ts                # All TypeScript interfaces
│   ├── store/
│   │   └── index.ts                # Zustand store (cart, currency, country, modals)
│   ├── middleware.ts               # next-intl locale routing
│   └── i18n.ts                     # next-intl config + isRtl()
├── messages/
│   ├── en.json                     # Source of truth for all keys
│   ├── he.json                     # Hebrew translations (complete)
│   └── es.json                     # Spanish translations (complete)
├── supabase/
│   ├── migrations/
│   │   ├── 20240101000001_create_products.sql
│   │   ├── 20240101000002_create_orders.sql
│   │   ├── 20240101000003_create_wholesale_accounts.sql
│   │   ├── 20240101000004_create_cart_sessions.sql
│   │   ├── 20240101000005_create_reviews.sql
│   │   └── 20240101000006_rls_b2b_products.sql
│   ├── seed.sql                    # Standalone seed (5 reviews + 4 products)
│   └── functions/
│       └── abandoned-cart/index.ts # Deno edge function
├── public/
│   ├── og-image.jpg                # Dark placeholder — replace before launch
│   └── favicon.ico                 # Dark placeholder — replace before launch
├── sentry.client.config.ts
├── sentry.server.config.ts
├── next.config.mjs                 # Security headers + withSentryConfig + withNextIntl
└── .env.example                    # All env vars documented (no values)
```

---

## 10. Analytics Functions (Current Signatures — Positional, Not Object)

These were changed in Wave 5. Always use positional args:

```ts
trackViewProduct(color: ProductColor, currency: Currency, price: number)
trackSelectColor(newColor: ProductColor, prevColor: ProductColor)
trackAddToCart(color: ProductColor, qty: number, type: 'b2c' | 'b2b')
trackBeginCheckout(totalUsd: number, itemCount: number, type: 'b2c' | 'b2b')
trackPurchase(orderId: string, totalUsd: number, currency: Currency)
trackOpenWholesale(source: 'nav' | 'footer' | 'buy_now')
trackSignupWholesale(country: string)
```

---

## 11. Known Blockers

| Blocker | Owner | Contact |
|---|---|---|
| Tapuz production customer code | Guy at Tapuz Express | guy.g@tapuzdelivery.co.il / 0509964699 |
| Cloudinary product images not uploaded | Site owner | Must upload under `slider/` prefix: `kit-black`, `kit-blue`, `kit-purple`, `display-box-front/side/top`, `logo-white` |
| `NEXT_PUBLIC_APP_URL` not in Vercel | Site owner | Add `https://slidersolution.com` to Vercel env vars |
| DNS not switched yet | Site owner | Currently pointing to WordPress — switch after full QA |
| Real OG image + favicon | Site owner | Replace `public/og-image.jpg` and `public/favicon.ico` with branded assets |

---

## 12. Supabase Tables

| Table | Purpose | RLS |
|---|---|---|
| `products` | B2C and B2B product catalog with stock | Public read for b2c; authenticated wholesale for b2b |
| `orders` | All B2C and B2B orders | Service role only |
| `wholesale_accounts` | Approved wholesale partners | Owner reads own row |
| `cart_sessions` | Abandoned cart tracking | Service role |
| `reviews` | Customer reviews (moderated) | Public read for `approved=true` only |

---

## 13. Starting a New Session

Paste the contents of `NEW_SESSION_PROMPT.md` as your first message in a new Claude Code session. The session starter will instruct Claude to read HANDOFF.md, PROGRESS.md, and key lib files before doing anything.
