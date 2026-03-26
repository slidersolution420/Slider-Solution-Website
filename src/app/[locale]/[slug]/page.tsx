import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/keystatic'
import NavBar from '@/components/ui/NavBar'
import Footer from '@/components/ui/Footer'

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

  const title = locale === 'he' ? page.title_he : page.title_en

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-surface pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-8 text-3xl font-bold text-white">{title}</h1>
          <div className="prose prose-invert prose-sm max-w-none text-gray-400">
            {/* MDX content rendering would go here — for now show raw text */}
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(page.body, null, 2)}</pre>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
