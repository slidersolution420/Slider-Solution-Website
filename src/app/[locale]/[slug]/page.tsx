import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/cms'
import type { PageSection } from '@/lib/cms'
import NavBar from '@/components/ui/NavBar'
import Footer from '@/components/ui/Footer'
import { routing } from '@/i18n/routing'

export const revalidate = 3600 // revalidate hourly — content is in Supabase

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ['terms', 'refund', 'cookies'].map((slug) => ({ locale, slug }))
  )
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await getPage(slug)
  if (!page) return {}

  return {
    title: `${locale === 'he' ? page.title_he : page.title_en} — SLIDER`,
  }
}

export default async function ContentPage({ params }: PageProps) {
  const { locale, slug } = await params
  const page = await getPage(slug)

  if (!page) notFound()

  const isHe = locale === 'he'
  const title = isHe ? page.title_he : page.title_en
  const sections: PageSection[] = isHe ? page.sections_he : page.sections_en

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-surface pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-10 text-3xl font-bold text-white">{title}</h1>
          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i}>
                {section.heading && (
                  <h2 className="mb-2 text-lg font-semibold text-white">{section.heading}</h2>
                )}
                <p className="text-sm leading-relaxed text-gray-400">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
