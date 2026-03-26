interface TickerBarProps {
  text: string
  rtl?: boolean
}

export default function TickerBar({ text, rtl = false }: TickerBarProps) {
  // Duplicate text so the marquee loops seamlessly
  const content = `${text}  •  ${text}`

  return (
    <div className="overflow-hidden border-y border-white/10 bg-brand-900/30 py-2.5">
      <div
        className={`flex whitespace-nowrap text-sm text-brand-300 ${
          rtl ? 'animate-marquee-rtl' : 'animate-marquee'
        }`}
        aria-hidden="true"
      >
        <span className="inline-block">{content}</span>
        <span className="inline-block">{content}</span>
      </div>
    </div>
  )
}
