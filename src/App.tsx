import { useEffect, useLayoutEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Hero } from './sections/Hero'
import { Growth } from './sections/Growth'
import { Services } from './sections/Services'
import { Worlds } from './sections/Worlds'
import { Care } from './sections/Care'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { DUR, EASE, MQ, ScrollTrigger, gsap } from './lib/motion'

/** Wiederkehrende Reveals: Zeilenmasken, ruhige Einblendungen, Bildmasken. */
function useGlobalReveals() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MQ, (ctx) => {
      const { reduce } = ctx.conditions as { reduce: boolean }
      const lines = gsap.utils.toArray<HTMLElement>('[data-lines]')
      const fades = gsap.utils.toArray<HTMLElement>('[data-fade]')
      const masks = gsap.utils.toArray<HTMLElement>('[data-mask]')

      if (reduce) {
        // Nur kurze Überblendungen, keine Bewegung
        ;[...lines, ...fades, ...masks].forEach((el) =>
          gsap.from(el, { opacity: 0, duration: 0.4, scrollTrigger: { trigger: el, start: 'top 92%' } }),
        )
        return
      }

      lines.forEach((el) =>
        gsap.from(el.querySelectorAll('.ln-i'), {
          yPercent: 115, duration: DUR.slow, ease: EASE.reveal, stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        }),
      )
      fades.forEach((el) =>
        gsap.from(el, { y: 32, opacity: 0, duration: DUR.base, ease: EASE.reveal, scrollTrigger: { trigger: el, start: 'top 90%' } }),
      )
      masks.forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: DUR.scene, ease: EASE.scene, scrollTrigger: { trigger: el, start: 'top 85%' } })
        gsap.fromTo(el.querySelector('img'), { scale: 1.3 }, { scale: 1, duration: 2, ease: EASE.reveal, scrollTrigger: { trigger: el, start: 'top 85%' } })
      })
    })
    return () => mm.revert()
  }, [])
}

export default function App() {
  useGlobalReveals()

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        Zum Inhalt springen
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Growth />
        <Services />
        <Worlds />
        <Care />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
