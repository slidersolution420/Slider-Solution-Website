import type { ProductContent } from '@/lib/keystatic'

interface HowItWorksProps {
  product: ProductContent
  locale: string
}

export default function HowItWorks({ product, locale }: HowItWorksProps) {
  const steps = product.steps ?? []

  return (
    <section className="bg-gray-900/50 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            {locale === 'he' ? 'איך זה עובד?' : 'How It Works'}
          </h2>
          <p className="mt-3 text-gray-400">
            {locale === 'he' ? 'שלושה שלבים פשוטים' : 'Three simple steps'}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const title = locale === 'he' ? step.title_he : step.title_en
            const desc = locale === 'he' ? step.desc_he : step.desc_en

            return (
              <div key={i} className="relative text-center">
                {/* Step number */}
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white shadow-lg shadow-brand-900/40">
                  {i + 1}
                </div>

                {/* Connector line (not on last) */}
                {i < steps.length - 1 && (
                  <div className="absolute top-8 start-1/2 hidden h-0.5 w-full bg-gradient-to-r from-brand-700 to-transparent md:block" />
                )}

                <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
