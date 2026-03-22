'use client'

import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { trackSelectColor } from '@/lib/analytics'
import type { ProductColor } from '@/lib/types'

const SWATCHES: { color: ProductColor; bg: string; border: string }[] = [
  { color: 'black', bg: 'bg-[#0F0F0F]', border: 'border-gray-600' },
  { color: 'blue', bg: 'bg-[#1D4ED8]', border: 'border-blue-600' },
  { color: 'purple', bg: 'bg-[#7C3AED]', border: 'border-purple-600' },
]

interface ColorSwatchProps {
  className?: string
}

export default function ColorSwatch({ className = '' }: ColorSwatchProps) {
  const t = useTranslations('swatch')
  const selectedColor = useStore((s) => s.selectedColor)
  const setSelectedColor = useStore((s) => s.setSelectedColor)

  function handleSelect(color: ProductColor) {
    if (color === selectedColor) return
    trackSelectColor({ color, previousColor: selectedColor })
    setSelectedColor(color)
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SWATCHES.map(({ color, bg, border }) => {
        const isSelected = selectedColor === color
        return (
          <button
            key={color}
            onClick={() => handleSelect(color)}
            aria-label={t(`label.${color}`)}
            aria-pressed={isSelected}
            className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 ${bg} ${border} ${
              isSelected
                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#07080F] scale-110'
                : 'opacity-60 hover:opacity-100'
            }`}
          />
        )
      })}
    </div>
  )
}
