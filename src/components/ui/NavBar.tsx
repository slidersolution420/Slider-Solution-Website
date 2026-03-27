'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store'
import { ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from '@/i18n/navigation'
import LanguageSwitcher from './LanguageSwitcher'

export default function NavBar() {
  const t = useTranslations('nav')
  const { totalItems, openCart } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const count = totalItems()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: t('home'), cta: false },
    { href: '/contact', label: t('contact'), cta: false },
    { href: '/wholesale', label: t('wholesale'), cta: true },
  ]

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-950/95 backdrop-blur-md shadow-lg' : 'bg-gray-950/70 backdrop-blur-sm'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
              <rect x="0" y="0" width="16" height="2.5" rx="1.25" fill="white"/>
              <rect x="0" y="5.75" width="16" height="2.5" rx="1.25" fill="white"/>
              <rect x="0" y="11.5" width="16" height="2.5" rx="1.25" fill="white"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">SLIDER</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.cta
                  ? 'rounded-full border border-purple-500 px-3.5 py-1 text-sm font-semibold text-purple-400 transition-colors hover:bg-purple-500/10 hover:text-purple-300'
                  : 'text-sm text-gray-300 transition-colors hover:text-white'
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {/* Cart button */}
          <button
            onClick={openCart}
            className="relative flex size-9 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Open cart"
          >
            <ShoppingBagIcon className="size-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="flex size-9 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XMarkIcon className="size-5" /> : <Bars3Icon className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-gray-950 px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.cta
                  ? 'block py-3 text-base font-semibold text-purple-400 hover:text-purple-300'
                  : 'block py-3 text-base text-gray-200 hover:text-white'
              }
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
