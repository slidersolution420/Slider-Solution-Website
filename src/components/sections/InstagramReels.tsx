interface InstagramReelsProps {
  locale: string
}

const REEL_IDS = [
  'DVYr6w7iIug',
  'DUgFUfbiN5W',
  'DOByE4hCKow',
  'DShyv2eiNFq',
  'DOQiGgtCGSN',
  'DOOER7UiFCf',
]

export default function InstagramReels({ locale }: InstagramReelsProps) {
  const isHe = locale === 'he'
  const title = isHe ? 'עקבו אחרינו' : 'Follow Us'
  const instagramUrl = 'https://www.instagram.com/slider.solution'

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

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {REEL_IDS.map((id) => (
            <a
              key={id}
              href={`https://www.instagram.com/reel/${id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border border-white/10 transition-colors hover:border-white/25 sm:rounded-2xl"
            >
              <iframe
                src={`https://www.instagram.com/reel/${id}/embed/`}
                className="h-[140px] w-full sm:h-[360px] lg:h-[480px]"
                loading="lazy"
                allowFullScreen
                scrolling="no"
                frameBorder="0"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
