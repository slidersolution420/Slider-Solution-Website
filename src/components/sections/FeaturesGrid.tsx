import {
  CogIcon,
  FunnelIcon,
  ArchiveBoxIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import type { ProductContent } from '@/lib/cms'

interface FeaturesGridProps {
  product: ProductContent
  locale: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  cog: CogIcon,
  funnel: FunnelIcon,
  'archive-box': ArchiveBoxIcon,
  shield: ShieldCheckIcon,
}

export default function FeaturesGrid({ product, locale }: FeaturesGridProps) {
  const features = product.features ?? []

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            {locale === 'he' ? 'למה SLIDER?' : 'Why SLIDER?'}
          </h2>
          <p className="mt-3 text-gray-400">
            {locale === 'he'
              ? 'ארבעה יתרונות שמשנים את כל החוויה'
              : 'Four advantages that change the whole experience'}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] ?? CogIcon
            const title = locale === 'he' ? feature.title_he : feature.title_en
            const desc = locale === 'he' ? feature.desc_he : feature.desc_en

            return (
              <div
                key={i}
                className="group rounded-2xl border border-white/10 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 transition-all hover:border-brand-500/40 hover:shadow-[0_0_30px_-5px] hover:shadow-brand-900/50"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-900/50 transition-colors group-hover:bg-brand-800/50">
                  <Icon className="size-6 text-brand-400" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
