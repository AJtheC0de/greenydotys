import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

/**
 * Gemeinsame Bewegungssprache von greendot.
 * - reveal: Inhalte treten ruhig und bestimmt auf (expo.out)
 * - scene:  Szenenwechsel und Masken (power3.inOut)
 * - grow:   organisches Wachstum (power2.out)
 */
export const EASE = {
  reveal: 'expo.out',
  scene: 'power3.inOut',
  grow: 'power2.out',
  linear: 'none',
} as const

export const DUR = { fast: 0.45, base: 0.9, slow: 1.3, scene: 1.6 } as const

export const MQ = {
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const

export type MotionConditions = { desktop: boolean; mobile: boolean; reduce: boolean }

/**
 * Initialisiert Animationen pro Breakpoint/Bewegungspräferenz.
 * gsap.matchMedia räumt bei Wechsel und beim Unmount alles sauber auf.
 */
export function useMotion<T extends HTMLElement>(
  scope: RefObject<T | null>,
  setup: (c: MotionConditions, el: T) => void | (() => void),
) {
  useLayoutEffect(() => {
    const el = scope.current
    if (!el) return
    const mm = gsap.matchMedia(el)
    mm.add(MQ, (ctx) => setup(ctx.conditions as MotionConditions, el))
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(MQ.reduce).matches

export { gsap, ScrollTrigger }
