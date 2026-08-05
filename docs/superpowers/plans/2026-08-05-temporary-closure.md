# סגירה זמנית של slidersolution.com — תוכנית ביצוע

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended for this plan — tasks are small and serial) or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** האתר החי slidersolution.com מציג בכל URL עמוד "סגרנו זמנית" עם כפתור ווצאפ ‎+972 52-455-3311, בלי למחוק שום דבר — קוד, תוכן, דאטה והגדרות נשארים; הפתיחה מחדש היא היפוך דגל אחד.

**Architecture:** דגל `SITE_CLOSED` בקובץ מקומפל (`src/lib/site-status.ts`) + שער ב-`src/middleware.ts`: כל עמוד שאינו ברשימת החריגים מקבל redirect ‎307 (זמני) אל `/closed` לפי הלוקאל; כל API שאינו ברשימת החריגים מחזיר 503. עמוד `/[locale]/closed` חדש מתורגם ל-4 השפות. אדמין, השלמת תשלום שכבר בתהליך (`/thankyou` + verify), והקרון נשארים פתוחים; הקרון מדלג בפועל כשהדגל דולק.

**Tech Stack:** Next.js 16.2.1 (App Router) · next-intl v4 (`en` דיפולט ללא prefix; `he` RTL, `es`, `de`) · Tailwind v4 · Vercel (פרויקט `slidersolution.com`, דיפלוי אוטומטי מ-push ל-GitHub).

**מודל לביצוע:** כל המשימות — **Sonnet** (`claude-sonnet-5`). הכל מפורט וכמעט מכני; שיקול-הדעת כבר הוכרע בתוכנית.

**פרוטוקול סטיות (חובה):** לא עוצרים לשאלות באמצע. כשמשהו במציאות לא תואם את התוכנית — בוחרים את האופציה השמרנית ביותר (זו שלא מוחקת/משנה הכי מעט), רושמים שורה בקובץ ההחלטות `docs/superpowers/plans/2026-08-05-temporary-closure-decisions.md` (נוצר במשימה 0), וממשיכים. נדב עובר על הקובץ אחרי הביצוע.

---

## עובדות שאומתו ב-5/8/2026 (אל תבדוק מחדש, אל תסמוך על CLAUDE.md בסתירה)

- **הריפו:** `/Users/nadavbar-on/Projects/Slider-Solution-Website`, ‏origin = `github.com/slidersolution420/Slider-Solution-Website`.
- **ענפים:** ה-checkout על `main`, ‏`main == origin/main` (HEAD `825af63`). ‏`develop` קיים אך **מאחורי main ב-3 קומיטים** ואין בו קומיטים ייחודיים (`git log main..develop` ריק) — מותר וצריך ליישר אותו על main.
- **כלל ענפים של הריפו:** קומיטים ל-`develop` בלבד; merge ל-`main` רק כשמתבקש מפורשות — **המשימה הזו היא הבקשה המפורשת** (סגירת האתר החי מחייבת פרודקשן).
- **פרודקשן = `main`** (הסקה: כלל הענפים + האתר החי תואם את main). אם מתברר שגם push ל-develop מייצר דיפלוי פרודקשן — התוצאה זהה, רק מוקדם יותר; לא תקלה.
- **WIP של נדב בתיקיית העבודה הראשית — אסור לגעת:** שינויים לא-מקומטים ב-`.env.example` וב-`src/lib/tapuz.ts`, ותיקיות/קבצים לא-עקובים (`.claire/`, `.claude/`, `.codex/`, `.mcp.json`, `AGENTS.md`, `supabase/.temp/`). לכן העבודה נעשית ב-**worktree נפרד** (משימה 0). לעולם לא `git stash` / `git checkout -- .` / `git reset --hard` בתיקייה הראשית.
- **CLAUDE.md של הריפו מיושן בחלקו:** כתוב "2 לוקאלים" ו-"he דיפולט" — בפועל 4 לוקאלים ו-`en` דיפולט (`src/i18n/routing.ts`); ‏Keystatic UI route לא קיים ב-`src/app`. אל תתקן את CLAUDE.md (מחוץ לתחולה) — רק אל תיבהל מהסתירה.
- **הקרון הקיים** (`/api/cron/abandoned-cart`, POST עם `Bearer CRON_SECRET`) קורא ל-`/api/email/abandoned-cart` שלא קיים ב-`src/app/api` — כנראה שבור עוד מקודם. לא מתקנים; רק מוסיפים דילוג בזמן סגירה.
- **slidersolution.co.il** יושב על Render מושעה (מחזיר 402 מאחורי Cloudflare) — כבר "סגור" בפועל, **מחוץ לתחולת התוכנית**. www.slidersolution.com מגיע לאותו פרויקט Vercel ומכוסה אוטומטית.
- **אין תשתית טסטים בריפו** (אין jest/vitest). אל תוסיף. האימות: `type-check` + `lint` + `build` + מטריצת curl מול שרת מקומי ואז מול פרודקשן.

## מפת קבצים

| קובץ | פעולה | אחריות |
|---|---|---|
| `src/lib/site-status.ts` | יצירה | הדגל `SITE_CLOSED` — נקודת האמת היחידה |
| `src/middleware.ts` | עריכה | שער הסגירה (redirect עמודים, 503 ל-API) + intl הקיים |
| `src/app/[locale]/closed/page.tsx` | יצירה | עמוד "סגרנו זמנית" (server component, מתורגם) |
| `messages/{en,he,es,de}.json` | עריכה | מפתח `closed` חדש (4 קבצים) |
| `src/app/api/cron/abandoned-cart/route.ts` | עריכה | דילוג כשהאתר סגור |
| `docs/superpowers/plans/…` | הוספה | התוכנית + קובץ ההחלטות, מקומטים לריפו |

שום קובץ לא נמחק ושום שורה קיימת לא נמחקת — רק תוספות ועטיפה.

---

### Task 0: Preflight — יישור develop, worktree נקי, קובץ החלטות

**Files:** אין שינויי קוד. עבודה ב-git בלבד.

- [ ] **Step 0.1: אימות מצב מוצא**

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website
git fetch origin
git status --short --branch
git log --oneline -1 main
```

צפוי: `## main...origin/main` (בלי ahead/behind), ‏HEAD ‏`825af63`, והקבצים המלוכלכים מהרשימה למעלה. אם `origin/main` התקדם מעבר ל-`825af63` — לא תקלה: רשום בקובץ ההחלטות את ה-SHA החדש והמשך, כל התוכנית תקפה מול ה-HEAD העדכני. רשום את ה-SHA של main בקובץ ההחלטות בתור `PRE_CLOSURE_SHA` (לצורך rollback חירום).

- [ ] **Step 0.2: יצירת קובץ ההחלטות**

צור את `docs/superpowers/plans/2026-08-05-temporary-closure-decisions.md` (בתיקייה הראשית; יועתק ל-worktree ויקומט במשימה 6):

```markdown
# החלטות ביצוע — סגירה זמנית 5/8/2026
- PRE_CLOSURE_SHA: <SHA של main מ-Step 0.1>
<!-- כל סטייה מהתוכנית: שורה אחת — מה קרה, מה נבחר, למה זו האופציה השמרנית -->
```

- [ ] **Step 0.3: יישור develop על main ופתיחת worktree**

`develop` לא בשימוש באף checkout (הראשית על main), ואין בו קומיטים ייחודיים — הזזת המצביע בטוחה:

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website
git branch -f develop main
git worktree add ../Slider-Solution-Website-closure-wt develop
```

צפוי: `Preparing worktree (checking out 'develop')`. מעכשיו **כל** פקודות הקוד/קומיט רצות בתוך `../Slider-Solution-Website-closure-wt`.

- [ ] **Step 0.4: התקנת תלויות והעתקת env ל-worktree**

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website-closure-wt
npm ci
cp /Users/nadavbar-on/Projects/Slider-Solution-Website/.env.local .env.local
```

צפוי: התקנה נקייה (~1-2 דק'). ה-`.env.local` נחוץ ל-`next build`/`start` מקומיים (Supabase env); הוא ב-.gitignore ולא יקומט. אם ה-`cp` נחסם ע"י ה-classifier — דלג, רשום בהחלטות, והסתמך על Step 4.1 (type-check+lint) + אימות פרודקשן במשימה 5 במקום build מקומי.

- [ ] **Step 0.5: בייסליין**

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website-closure-wt
npm run type-check && npm run lint
```

צפוי: נקי (ה-worktree לא מכיל את ה-WIP של tapuz.ts). אם יש שגיאות קיימות — רשום בהחלטות והמשך; אל תתקן קוד שלא קשור לסגירה.

### Task 1: דגל הסגירה + טקסטים ב-4 שפות

**Files:**
- Create: `src/lib/site-status.ts`
- Modify: `messages/en.json`, `messages/he.json`, `messages/es.json`, `messages/de.json`

- [ ] **Step 1.1: צור את `src/lib/site-status.ts`** (תוכן מלא):

```ts
/**
 * Master switch for the temporary-closure page.
 * Flip to `false`, commit to develop, push, then `git push origin develop:main`
 * to reopen the site. Nothing else needs to change.
 */
export const SITE_CLOSED = true
```

- [ ] **Step 1.2: הוסף מפתח `closed` לקבצי התרגום**

בכל אחד מארבעת הקבצים, הוסף את הבלוק כמפתח top-level ראשון — מיד אחרי ה-`{` הפותח של הקובץ, עם פסיק אחרי הבלוק. אל תיגע בשאר המפתחות.

`messages/en.json`:

```json
  "closed": {
    "metaTitle": "Slider Solution — Temporarily Closed",
    "title": "We're temporarily closed",
    "body": "The Slider Solution store is taking a short break. You can reach us anytime on WhatsApp — we'd love to hear from you.",
    "cta": "Chat with us on WhatsApp"
  },
```

`messages/he.json`:

```json
  "closed": {
    "metaTitle": "Slider Solution — סגור זמנית",
    "title": "סגרנו זמנית",
    "body": "חנות Slider Solution יוצאת להפסקה קצרה. לכל שאלה אפשר ליצור איתנו קשר בווצאפ — נשמח לשמוע מכם.",
    "cta": "דברו איתנו בווצאפ"
  },
```

`messages/es.json`:

```json
  "closed": {
    "metaTitle": "Slider Solution — Cerrado temporalmente",
    "title": "Cerrado temporalmente",
    "body": "La tienda de Slider Solution está haciendo una pausa. Puedes escribirnos por WhatsApp para cualquier consulta.",
    "cta": "Escríbenos por WhatsApp"
  },
```

`messages/de.json`:

```json
  "closed": {
    "metaTitle": "Slider Solution — Vorübergehend geschlossen",
    "title": "Vorübergehend geschlossen",
    "body": "Der Slider-Solution-Shop macht eine kurze Pause. Bei Fragen erreichst du uns jederzeit per WhatsApp.",
    "cta": "Schreib uns auf WhatsApp"
  },
```

- [ ] **Step 1.3: אימות JSON תקין**

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website-closure-wt
for f in messages/*.json; do python3 -c "import json;json.load(open('$f'))" && echo "OK $f"; done
```

צפוי: ‏`OK` לכל ארבעת הקבצים.

- [ ] **Step 1.4: פורמט + קומיט**

```bash
npx prettier --write src/lib/site-status.ts messages/en.json messages/he.json messages/es.json messages/de.json
git add src/lib/site-status.ts messages/en.json messages/he.json messages/es.json messages/de.json
git commit -m "feat: add site-closed flag and closure copy (en/he/es/de)"
```

### Task 2: עמוד הסגירה

**Files:**
- Create: `src/app/[locale]/closed/page.tsx`

הקשר: ‏`[locale]/layout.tsx` כבר מספק `<html lang dir>` (RTL לעברית), פונט Inter, רקע כהה (`--color-surface`) וטקסט לבן מ-`globals.css`. אין Header/Footer ב-layout, אז העמוד עומד לבד ואין ניווט לחסום. `@heroicons/react` כבר תלות קיימת.

- [ ] **Step 2.1: צור את `src/app/[locale]/closed/page.tsx`** (תוכן מלא):

```tsx
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'

const WHATSAPP_URL = 'https://wa.me/972524553311'
const WHATSAPP_DISPLAY = '+972 52-455-3311'

interface ClosedPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ClosedPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'closed' })
  return { title: t('metaTitle') }
}

export default async function ClosedPage({ params }: ClosedPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'closed' })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold tracking-widest text-brand-400 uppercase">Slider Solution</p>
      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t('title')}</h1>
      <p className="mt-4 max-w-md text-lg text-white/70">{t('body')}</p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-lg font-semibold text-black transition-transform hover:scale-105"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" aria-hidden="true" />
        {t('cta')}
      </a>
      <p className="mt-3 text-sm text-white/50" dir="ltr">
        {WHATSAPP_DISPLAY}
      </p>
    </main>
  )
}
```

- [ ] **Step 2.2: פורמט, אימות טיפוסים, קומיט**

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website-closure-wt
npx prettier --write "src/app/[locale]/closed/page.tsx"
npm run type-check
git add "src/app/[locale]/closed/page.tsx"
git commit -m "feat: add temporarily-closed page with WhatsApp contact"
```

צפוי: ‏type-check נקי.

### Task 3: שער הסגירה ב-middleware + דילוג בקרון

**Files:**
- Modify: `src/middleware.ts` (החלפה מלאה של תוכן הקובץ)
- Modify: `src/app/api/cron/abandoned-cart/route.ts` (שתי תוספות נקודתיות)

- [ ] **Step 3.1: החלף את תוכן `src/middleware.ts` בזה** (תוכן מלא; שים לב — ה-matcher עכשיו כולל `/api` בכוונה):

```ts
/**
 * next-intl locale detection and routing + temporary-closure gate.
 * Must be named middleware.ts — Next.js only recognises this filename.
 *
 * While SITE_CLOSED is true (src/lib/site-status.ts):
 *   - every page outside OPEN_PAGE_PREFIXES 307-redirects to the locale's /closed page
 *   - every API outside OPEN_API_PREFIXES returns 503
 *   - admin, in-flight payment completion (/thankyou + verify) and cron stay reachable
 */
import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { SITE_CLOSED } from './lib/site-status'

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
})

/** Path prefixes (after stripping the locale) that stay reachable while closed. */
const OPEN_PAGE_PREFIXES = ['/closed', '/admin', '/thankyou']
const OPEN_API_PREFIXES = ['/api/admin', '/api/checkout/verify', '/api/cron']

/** Non-default locales that appear as a URL prefix ('en' is prefix-less). */
const LOCALE_PREFIX = /^\/(he|es|de)(?=\/|$)/

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api')) {
    if (SITE_CLOSED && !OPEN_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      return NextResponse.json({ error: 'Site temporarily closed' }, { status: 503 })
    }
    return NextResponse.next()
  }

  if (SITE_CLOSED) {
    const localeMatch = pathname.match(LOCALE_PREFIX)
    const locale = localeMatch ? localeMatch[1] : null
    const rest = locale ? pathname.slice(locale.length + 1) || '/' : pathname
    const isOpen = OPEN_PAGE_PREFIXES.some((p) => rest === p || rest.startsWith(`${p}/`))
    if (!isOpen) {
      const url = request.nextUrl.clone()
      url.pathname = locale ? `/${locale}/closed` : '/closed'
      url.search = ''
      return NextResponse.redirect(url, 307)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - Next.js internals (_next, _vercel)
     *   - files with extensions (images, fonts, robots.txt, sitemap.xml, etc.)
     * NOTE: /api IS matched — the closure gate 503s non-allowlisted APIs.
     *       When SITE_CLOSED is false, /api passes straight through (same as before).
     */
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}
```

- [ ] **Step 3.2: הוסף דילוג לקרון**

ב-`src/app/api/cron/abandoned-cart/route.ts`: הוסף import בראש הקובץ, ובלוק מיד **אחרי** בדיקת ה-`authHeader` הקיימת (כדי ש-curl לא-מאומת עדיין יקבל 401):

```ts
import { SITE_CLOSED } from '@/lib/site-status'
```

```ts
  // Site is temporarily closed — skip abandoned-cart emails entirely.
  if (SITE_CLOSED) {
    return NextResponse.json({ skipped: 'site closed' })
  }
```

- [ ] **Step 3.3: פורמט, אימות, קומיט**

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website-closure-wt
npx prettier --write src/middleware.ts src/app/api/cron/abandoned-cart/route.ts
npm run type-check && npm run lint
git add src/middleware.ts src/app/api/cron/abandoned-cart/route.ts
git commit -m "feat: gate site behind temporary-closure flag"
```

צפוי: נקי.

### Task 4: אימות מקומי מלא

**Files:** אין שינויים מתוכננים; תיקונים רק אם האימות מגלה בעיה (fix-forward, קומיט `fix:` נפרד, שורה בהחלטות).

- [ ] **Step 4.1: build**

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website-closure-wt
npm run build
```

צפוי: build מוצלח. אם נכשל על env חסר (כי Step 0.4 דולג) — עבור למשימה 5 והסתמך על אימות הפרודקשן; רשום בהחלטות.

- [ ] **Step 4.2: הרם שרת פרודקשן מקומי על פורט 3002** (רץ ברקע; ייהרג ב-Step 4.4)

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website-closure-wt
npm run start -- -p 3002
```

- [ ] **Step 4.3: מטריצת curl** (הרץ כבלוק אחד; השווה לציפיות)

```bash
B=http://localhost:3002
w() { curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$@"; }
echo "root:      $(w $B/)"                              # צפוי: 307 …/closed
echo "he:        $(w $B/he)"                            # צפוי: 307 …/he/closed
echo "checkout:  $(w $B/checkout)"                      # צפוי: 307 …/closed
echo "he/chk:    $(w $B/he/checkout)"                   # צפוי: 307 …/he/closed
echo "es:        $(w $B/es)"                            # צפוי: 307 …/es/closed
echo "de:        $(w $B/de)"                            # צפוי: 307 …/de/closed
echo "closed:    $(w $B/closed)"                        # צפוי: 200
echo "he/closed: $(w $B/he/closed)"                     # צפוי: 200
echo "admin:     $(w $B/he/admin)"                      # צפוי: 200
echo "thankyou:  $(w $B/thankyou)"                      # צפוי: 200
echo "api/chk:   $(w -X POST $B/api/checkout)"          # צפוי: 503
echo "api/cart:  $(w $B/api/cart-session)"              # צפוי: 503
echo "api/admin: $(w $B/api/admin/wholesale)"           # צפוי: לא 503 (401/405/200)
echo "api/cron:  $(w -X POST $B/api/cron/abandoned-cart)" # צפוי: 401 (auth לפני הדילוג)
echo "wa link:   $(curl -s $B/closed | grep -c 'wa.me/972524553311')"      # צפוי: 1 ומעלה
echo "he text:   $(curl -s $B/he/closed | grep -c 'סגרנו זמנית')"          # צפוי: 1 ומעלה
```

כל סטייה — עצור, אבחן מול הקוד, תקן, קמפל, הרץ שוב את המטריצה, קומיט `fix:` ושורה בהחלטות.

- [ ] **Step 4.4: כבה את השרת המקומי**

```bash
kill -9 $(lsof -t -i :3002) 2>/dev/null; sleep 1; lsof -i :3002 || echo "port 3002 clear"
```

### Task 5: דיפלוי לפרודקשן ואימות חי

- [ ] **Step 5.1: push ל-develop** (דיפלוי preview ב-Vercel — לא חוסם)

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website-closure-wt
git push origin develop
```

- [ ] **Step 5.2: קידום לפרודקשן** — push של develop אל main בלי לגעת ב-checkout הראשי:

```bash
git push origin develop:main
```

צפוי: fast-forward (‏main המרוחק היה ב-`PRE_CLOSURE_SHA` שהוא האב של הקומיטים שלנו). אם נדחה כ-non-fast-forward — מישהו דחף ל-main במקביל: ‏`git fetch origin && git merge origin/main` בתוך ה-worktree (על develop), פתור אם צריך, הרץ שוב את משימה 4, ואז חזור על 5.1–5.2. רשום בהחלטות.

- [ ] **Step 5.3: המתן לדיפלוי** (קריאת Bash אחת עם timeout של 600000ms):

```bash
for i in $(seq 1 20); do
  out=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://slidersolution.com/)
  echo "poll $i: $out"
  case "$out" in 307*closed*) echo DEPLOYED; break;; esac
  sleep 30
done
```

צפוי: ‏`DEPLOYED` תוך ~1-5 דקות. אם אחרי 10 דקות עדיין לא — אל תנסה כלים נוספים בעצמך; דווח לנדב שה-push עבר אבל הדיפלוי לא נצפה (כנראה צריך מבט ב-dashboard של Vercel, שרק לו יש) וצרף את פלט ה-poll. **Rollback חירום** (רק אם הפרודקשן נשבר בפועל, לא סתם איטי): ‏`git push origin PRE_CLOSURE_SHA:main --force-with-lease` או Instant Rollback ב-dashboard.

- [ ] **Step 5.4: מטריצת אימות מול פרודקשן** — הרץ את אותה מטריצה מ-Step 4.3 עם `B=https://slidersolution.com`. אותן ציפיות בדיוק, בתוספת:

```bash
curl -s https://www.slidersolution.com/ -o /dev/null -w "www: %{http_code} %{redirect_url}\n"   # צפוי: 307 אל …/closed (www מגיש את אותה אפליקציה)
```

### Task 6: סנכרון התיקייה הראשית וניקוי ה-worktree

- [ ] **Step 6.1: קומיט מסמכי התוכנית לריפו** (מתוך ה-worktree):

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website-closure-wt
mkdir -p docs/superpowers/plans
cp /Users/nadavbar-on/Projects/Slider-Solution-Website/docs/superpowers/plans/2026-08-05-temporary-closure.md docs/superpowers/plans/
cp /Users/nadavbar-on/Projects/Slider-Solution-Website/docs/superpowers/plans/2026-08-05-temporary-closure-decisions.md docs/superpowers/plans/
git add docs/superpowers/plans
git commit -m "docs: add temporary-closure execution plan and decisions log"
git push origin develop
git push origin develop:main
```

(עדכוני המשך לקובץ ההחלטות אחרי הנקודה הזו נשארים בעותק שבתיקייה הראשית ומסונכרנים ידנית ע"י נדב אם ירצה — אל תדחוף שוב בגללם.)

- [ ] **Step 6.2: יישור התיקייה הראשית** — בתיקייה הראשית, שהעץ המלוכלך שלה לא נגוע כי הקומיטים שלנו לא נוגעים באותם קבצים:

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website
git fetch origin
git merge --ff-only origin/main
```

אם ה-merge נכשל על "untracked working tree files would be overwritten" עבור שני קבצי ה-docs — הם העתקים זהים לאלה שקומטו; אמת זהות עם `git diff --no-index`, מחק **רק את שני הקבצים האלה** מהעותק הלא-עקוב, והרץ שוב את ה-merge. שום כישלון אחר — אל תכריח; השאר את הראשית כמו שהיא, רשום בהחלטות ודווח.

- [ ] **Step 6.3: הסרת ה-worktree** (מסיר רק את סביבת העבודה הזמנית; שום דאטה):

```bash
cd /Users/nadavbar-on/Projects/Slider-Solution-Website
git worktree remove ../Slider-Solution-Website-closure-wt
git worktree prune
git branch --show-current && git log --oneline -3
```

צפוי: הראשית על `main`, ההיסטוריה כוללת את קומיטי הסגירה, וה-WIP (`tapuz.ts`, `.env.example`) עדיין מלוכלך ושמור.

### Task 7: עדכון ה-vault (המוח של נדב)

**Files:**
- Modify: `/Users/nadavbar-on/Projects/nadav-vault/companies/slider-solution.md`
- Create: `/Users/nadavbar-on/Projects/nadav-vault/decisions/2026-08-05-סגירה-זמנית-אתר-סליידר.md`
- Modify: `/Users/nadavbar-on/Projects/nadav-vault/CHANGELOG.md` (או קובץ ה-CHANGELOG כפי שקיים ב-vault — בדוק את השם המדויק)

- [ ] **Step 7.1: עדכן את `companies/slider-solution.md`**: שנה בפרונטמטר `updated: 2026-08-05`; בסעיף "# האתר" עדכן את שורת הסטאק — הלוקאלים בפועל הם `en` (דיפולט, ללא prefix), `he` (RTL), `es`, `de` (מסיר את ה-`#VERIFY` על הספרדית); והוסף מיד אחרי כותרת "# סקירה" (לפני שאר הטקסט):

```markdown
> **האתר סגור זמנית מ-5/8/2026** — כל slidersolution.com מפנה לעמוד "סגרנו זמנית" עם כפתור ווצאפ (+972 52-455-3311). שום דבר לא נמחק: דגל `SITE_CLOSED` ב-`src/lib/site-status.ts` + שער ב-middleware. פתיחה מחדש: להפוך ל-`false`, ‏commit ל-develop, ‏push, ואז `git push origin develop:main`. אדמין והשלמת תשלומים שבדרך נשארו נגישים; קרון העגלות הנטושות מדלג. ‏slidersolution.co.il מושעה ב-Render (‏402) עוד מקודם — לא טופל.
```

- [ ] **Step 7.2: צור את רשומת ההחלטה** `decisions/2026-08-05-סגירה-זמנית-אתר-סליידר.md`:

```markdown
# סגירה זמנית של אתר Slider Solution
- **החלטה:** slidersolution.com נסגר זמנית — דגל `SITE_CLOSED` + שער middleware שמפנה כל עמוד ל-`/closed` (307) וחוסם API ציבורי (503); עמוד סגירה מתורגם עם ווצאפ +972 52-455-3311. אדמין, `/thankyou` + verify, וקרון נשארו פתוחים (הקרון מדלג).
- **למה:** נדב ביקש לסגור בלי למחוק כלום (5/8/2026); העסק מושהה לטובת CardsTrade. דגל בקוד = הפיך בקומיט אחד, שורד redeploy, בלי תלות ב-env של Vercel.
- **מה נדחה:** מחיקת/השבתת הפרויקט ב-Vercel (לא הפיך בקלות); עמוד סטטי עוקף-ריפו ב-Vercel (מפצל קונפיג); ‏503 לכל האתר (פוגע במיתוג בחיפוש); ‏env var ב-Vercel (דורש גישת dashboard/CLI מאומתת); ‏noindex על עמוד הסגירה (שומרים את האינדוקס הקיים — 307 מסמן זמניות).
- **תאריך:** 2026-08-05
```

- [ ] **Step 7.3: הוסף שורת CHANGELOG** (בפורמט הקיים בקובץ):

```markdown
- 2026-08-05: אתר Slider נסגר זמנית (עמוד ווצאפ, כלום לא נמחק) — בוצע לפי docs/superpowers/plans/2026-08-05-temporary-closure.md שבריפו.
```

### Task 8: דוח סיום וניקוי סשן

- [ ] **Step 8.1: דוח לנדב** — הודעת סיכום עם: מה חי עכשיו (URL + מה רואים), פלט מטריצת הפרודקשן, רשימת הקומיטים, מה נשאר פתוח (אדמין), איך פותחים מחדש (שורה אחת), ותוכן קובץ ההחלטות אם נרשמו סטיות.

- [ ] **Step 8.2: ניקוי חובה לפי ה-CLAUDE.md הגלובלי:**

```bash
kill -9 $(lsof -t -i :3000 -i :3001 -i :3002 -i :8080) 2>/dev/null
ps aux | grep claude-code | grep -v grep
ps aux | grep node | grep -v grep
```

ואז דווח: "✅ Session cleanup complete - no background processes running".

---

## החלטות שכבר התקבלו בתכנון (נדב — זה מה שאישרת בקריאת התוכנית)

1. **אדמין נשאר נגיש** (`/[locale]/admin` + `/api/admin/*`) — כדי שנדב יוכל לראות הזמנות/סיטונאים בזמן הסגירה. לא רוצים? מוחקים את `'/admin'` ו-`'/api/admin'` מהרשימות ב-middleware.
2. **`/thankyou` + `/api/checkout/verify` נשארים פתוחים** — רשת ביטחון לתשלום שאולי באמצע בדיוק ברגע הסגירה; תשלומים חדשים חסומים ממילא (‎`/api/checkout` מחזיר 503).
3. **307 ולא rewrite/503** — ‏redirect זמני משאיר את ה-URLs המקוריים באינדקס של גוגל לקראת פתיחה מחדש, וכתובת אחת ברורה למשתמש.
4. **בלי noindex, בלי לגעת ב-robots/sitemap** — סגירה זמנית; שומרים את נכסי ה-SEO.
5. **דגל בקוד ולא env var ב-Vercel** — הפיך בקומיט, לא תלוי בגישת dashboard, שורד כל redeploy.
6. **הקרון מדלג אבל לא מוסר מ-vercel.json** — אפס שינוי בקונפיג; חוזר לעבוד אוטומטית בפתיחה מחדש.
7. **slidersolution.co.il מחוץ לתחולה** — כבר מושעה (Render 402). אופציונלי בהמשך: להפנות DNS ל-Vercel.
8. **עברית/אנגלית/ספרדית/גרמנית** — העמוד מתורגם לכל 4 השפות הקיימות דרך next-intl, בהתאם לכלל "zero hardcoded strings".

## Pre-mortem — מה עלול להפתיע ומה עושים

- **ה-build המקומי נכשל על env** → המסלול החלופי מוגדר ב-Step 4.1 (אימות בפרודקשן).
- **פרודקשן ב-Vercel מוגדר דווקא על develop** → הסגירה עולה כבר ב-Step 5.1; ממשיכים כרגיל, רושמים בהחלטות.
- **אין דיפלוי אוטומטי מ-GitHub** (לא סביר — כך האתר עלה עד היום) → Step 5.3 מגדיר דיווח לנדב במקום נסיונות עקיפים.
- **מישהו דחף ל-main במקביל** → מטופל ב-Step 5.2 (fetch+merge+re-verify). ראה גם זיכרון: סשנים מקבילים חולקים checkout.
- **קונפליקט untracked docs ב-Step 6.2** → מטופל שם במפורש.
- **חוסם-קלאסיפייר על `cp .env.local`** → מסלול חלופי ב-Step 0.4.

## איך משגרים את סשן הביצוע

מתוך `/Users/nadavbar-on/Projects/Slider-Solution-Website` (או כל cwd — הנתיבים בתוכנית אבסולוטיים), סשן Claude Code על **Sonnet**, עם הפרומפט:

> בצע את התוכנית `/Users/nadavbar-on/Projects/Slider-Solution-Website/docs/superpowers/plans/2026-08-05-temporary-closure.md` עם superpowers:executing-plans. אל תעצור לשאלות — פעל לפי פרוטוקול הסטיות שבתוכנית.
