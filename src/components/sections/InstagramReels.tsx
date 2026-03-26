import { getSiteSettings } from '@/lib/keystatic'
import ReelVideo from './ReelVideo'

interface InstagramReelsProps {
  locale: string
}

export default async function InstagramReels({ locale }: InstagramReelsProps) {
  const settings = await getSiteSettings()
  const reels = settings.instagram_reels ?? []

  if (reels.length === 0) return null

  const isHe = locale === 'he'
  const title = isHe ? 'עקבו אחרינו' : 'Follow Us'
  const instagramUrl = settings.instagram_url ?? 'https://www.instagram.com/slider.solution'

  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-white">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-brand-400"
            >
              {title}
            </a>
          </h2>
          <p className="mt-2 text-gray-400">@slider.solution</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reels.map((reel, i) => (
            <ReelVideo
              key={i}
              videoUrl={reel.video_url}
              linkUrl={reel.link_url}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
