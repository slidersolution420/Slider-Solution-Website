import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing, isRtl } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import { Inter } from 'next/font/google'
import CurrencyInitializer from '@/components/ui/CurrencyInitializer'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound()
  }

  const messages = await getMessages()
  const dir = isRtl(locale) ? 'rtl' : 'ltr'

  return (
    <html lang={locale as Locale} dir={dir} className={inter.className}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CurrencyInitializer />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
