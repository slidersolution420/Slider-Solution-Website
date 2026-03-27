interface TickerBarProps {
  text: string
  rtl?: boolean
}

export default function TickerBar({ text, rtl = false }: TickerBarProps) {
  return (
    <div className="overflow-hidden border-y border-white/10 bg-brand-900/30 py-2.5">
      <div
        className={`flex w-max whitespace-nowrap text-sm text-brand-300 lg:[animation-duration:40s] ${
          rtl ? 'animate-marquee-rtl' : 'animate-marquee'
        }`}
        aria-hidden="true"
      >
        {/* 2 always-visible spans — mobile uses only these (1+1 groups) */}
        <span className="inline-block shrink-0 px-8">{text}</span>
        <span className="inline-block shrink-0 px-8">{text}</span>
        {/* 8 desktop-only spans — desktop sees all 10 (5+5 groups), fills wide viewports */}
        <span className="hidden lg:inline-block shrink-0 px-8">{text}</span>
        <span className="hidden lg:inline-block shrink-0 px-8">{text}</span>
        <span className="hidden lg:inline-block shrink-0 px-8">{text}</span>
        <span className="hidden lg:inline-block shrink-0 px-8">{text}</span>
        <span className="hidden lg:inline-block shrink-0 px-8">{text}</span>
        <span className="hidden lg:inline-block shrink-0 px-8">{text}</span>
        <span className="hidden lg:inline-block shrink-0 px-8">{text}</span>
        <span className="hidden lg:inline-block shrink-0 px-8">{text}</span>
      </div>
    </div>
  )
}
