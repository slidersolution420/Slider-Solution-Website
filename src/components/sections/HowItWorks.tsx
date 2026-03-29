import { getTranslations } from 'next-intl/server'
import { getConfig } from '@/lib/config'
import { PlayCircleIcon } from '@heroicons/react/24/solid'

interface HowItWorksProps {
  locale: string
}

export default async function HowItWorks({ locale: _locale }: HowItWorksProps) {
  const [t, config] = await Promise.all([
    getTranslations('how_it_works'),
    getConfig(),
  ])

  const videos = [
    { id: config.how_it_works_video1_id, title: t('card1_title'), desc: t('card1_desc') },
    { id: config.how_it_works_video2_id, title: t('card2_title'), desc: t('card2_desc') },
  ]

  return (
    <section className="bg-gray-900/50 py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            {t('title_before')}
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text font-black text-transparent">
              {t('title_highlight')}
            </span>
            ?
          </h2>
          <p className="mt-3 text-gray-400">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {videos.map((video, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{video.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{video.desc}</p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600">
                  <PlayCircleIcon className="size-5 text-white" />
                </div>
              </div>
              {video.id ? (
                <div className="aspect-video overflow-hidden rounded-xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    title={video.title}
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-white/5 text-sm text-gray-600">
                  Video coming soon
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
