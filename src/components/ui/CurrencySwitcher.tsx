'use client'

import { useStore } from '@/store'
import type { Currency } from '@/lib/types'

const CURRENCIES: { value: Currency; label: string; ariaLabel: string }[] = [
  { value: 'USD', label: '$', ariaLabel: 'Switch to USD' },
  { value: 'EUR', label: '€', ariaLabel: 'Switch to EUR' },
  { value: 'ILS', label: '₪', ariaLabel: 'Switch to ILS' },
]

export default function CurrencySwitcher() {
  const currency = useStore((s) => s.currency)
  const setCurrency = useStore((s) => s.setCurrency)

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Currency">
      {CURRENCIES.map(({ value, label, ariaLabel }) => (
        <button
          key={value}
          onClick={() => setCurrency(value)}
          aria-pressed={currency === value}
          aria-label={ariaLabel}
          className={`px-2 py-1 rounded-full text-sm font-outfit font-medium transition-colors duration-150 ${
            currency === value
              ? 'bg-purple-600 text-white'
              : 'border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
