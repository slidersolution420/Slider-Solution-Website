'use client'

import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  /** Once true, never goes back to false. Default: true */
  once?: boolean
}

/**
 * Returns [ref, isInView].
 * Attach ref to the element you want to observe.
 * By default triggers once (once=true) — perfect for scroll-reveal animations
 * that should NOT run on page load.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
): [React.RefObject<T>, boolean] {
  const { threshold = 0.15, rootMargin = '0px', once = true } = options
  const ref = useRef<T>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, isInView]
}
