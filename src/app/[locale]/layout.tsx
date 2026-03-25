import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, isRtl, type Locale } from '@/i18n'
import { WholesaleSessionRestorer } from '@/components/wholesale/WholesaleSessionRestorer'
import '../globals.css'

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ),
  title: {
    default: 'Slider Solution — The Original All-in-One Cone Kit',
    template: '%s | Slider Solution',
  },
  description:
    'Grind. Fill. Smoke. Perfected. The Slider Cone Kit includes a square grinder, wind-protected tray, funnel, and cones. Patent Protected.',
  keywords: [
    'cone kit',
    'slider solution',
    'grinder',
    'rolling kit',
    'patent protected',
  ],
  openGraph: {
    siteName: 'Slider Solution',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Slider Solution — The Original All-in-One Cone Kit',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

// ─── Layout ──────────────────────────────────────────────────────────────────

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = params

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()
  const dir = isRtl(locale) ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir} className="dark">
      <head>
        {/* Google Fonts — Syne Bold + Outfit */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#07080F] text-white font-outfit antialiased">
        <NextIntlClientProvider messages={messages}>
          <WholesaleSessionRestorer />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
