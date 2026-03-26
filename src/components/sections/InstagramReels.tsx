interface InstagramReelsProps {
  locale: string
  reelIds: string[]
}

export default function InstagramReels({ locale, reelIds }: InstagramReelsProps) {
  const isHe = locale === 'he'
  const title = isHe ? 'עקבו אחרינו' : 'Follow Us'

  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-white">
            <a
              href="https://www.instagram.com/slider.solution"
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
          {reelIds.map((id) => (
            <a
              key={id}
              href={`https://www.instagram.com/reel/${id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-white/25"
            >
              <iframe
                src={`https://www.instagram.com/reel/${id}/embed/`}
                className="h-[480px] w-full"
                allowFullScreen
                loading="lazy"
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
