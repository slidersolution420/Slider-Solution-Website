import { TruckIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'

export default function TrustBar() {
  const t = useTranslations('trust')

  const badges = [
    { icon: TruckIcon, title: t('shipping_title'), sub: t('shipping_sub') },
    { icon: LockClosedIcon, title: t('secure_title'), sub: t('secure_sub') },
    { icon: ShieldCheckIcon, title: t('guarantee_title'), sub: t('guarantee_sub') },
  ]

  return (
    <section className="border-y border-white/10 bg-gray-950 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {badges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-900/40">
                <badge.icon className="size-6 text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-white">{badge.title}</p>
                <p className="text-sm text-gray-500">{badge.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
