import { useRef } from 'react'
import { Img } from '../components/Img'
import { Lines } from '../components/Lines'
import { LinkButton } from '../components/Button'
import { DUR, EASE, gsap, useMotion } from '../lib/motion'

/** Blattform entlang +x, Basis im Ursprung. */
const leaf = (l: number, w: number) =>
  `M0 0 C ${l * 0.22} ${-w}, ${l * 0.72} ${-w * 1.05}, ${l} 0 C ${l * 0.72} ${w * 0.95}, ${l * 0.22} ${w}, 0 0 Z`

type Frond = { x: number; y: number; a: number; l: number; w: number; c: string }

const LEFT: Frond[] = [
  { x: -60, y: 1120, a: -78, l: 560, w: 90, c: '#0B2118' },
  { x: -40, y: 1120, a: -58, l: 640, w: 110, c: '#0F2A1E' },
  { x: -80, y: 1130, a: -36, l: 600, w: 100, c: '#0B2118' },
  { x: -20, y: 1140, a: -18, l: 520, w: 80, c: '#123323' },
  { x: 60, y: 1140, a: -92, l: 420, w: 60, c: '#123323' },
]
const RIGHT: Frond[] = [
  { x: 1980, y: 1120, a: -104, l: 520, w: 84, c: '#0B2118' },
  { x: 1990, y: 1130, a: -128, l: 640, w: 110, c: '#0F2A1E' },
  { x: 2000, y: 1140, a: -150, l: 560, w: 96, c: '#0B2118' },
  { x: 1960, y: 1140, a: -168, l: 460, w: 70, c: '#123323' },
]

function Foliage({ fronds, className }: { fronds: Frond[]; className: string }) {
  return (
    <g className={className}>
      {fronds.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.a})`}>
          <g className="frond">
            <path d={leaf(f.l, f.w)} fill={i % 2 ? 'url(#frond-a)' : 'url(#frond-b)'} />
            <path d={`M6 0 Q ${f.l * 0.5} ${-f.w * 0.12} ${f.l - 8} 0`} stroke="#1f4a33" strokeWidth="3" fill="none" opacity="0.7" />
          </g>
        </g>
      ))}
    </g>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)

  useMotion(ref, ({ desktop, reduce }, el) => {
    if (reduce) return
    const brand = document.querySelector('.site-header__brand')
    const nav = document.querySelectorAll('.site-nav li, .site-header__cta, .menu-toggle')

    // Einstieg: Wortmarke → Headline → Punkt → Landschaft. Nichts blockiert die Bedienung.
    const tl = gsap.timeline({ defaults: { ease: EASE.reveal } })
    tl.from(brand, { y: -16, opacity: 0, duration: DUR.base })
      .from(nav, { y: -12, opacity: 0, duration: DUR.base, stagger: 0.05 }, 0.1)
      .from('.hero__title .ln-i', { yPercent: 115, duration: DUR.slow, stagger: 0.12 }, 0.2)
      .from('.hero__dot', { scale: 0, duration: DUR.scene, ease: 'expo.out' }, 0.55)
      .from('.hero__ring', { scale: 0.2, opacity: 0, duration: 2, stagger: 0.15 }, 0.75)
      .from('.hero__img', { opacity: 0, scale: 1.25, duration: 2.2, ease: 'power3.out' }, 0.6)
      .from('.hero__fg .frond', { scale: 0.6, opacity: 0, duration: 1.8, stagger: 0.05, transformOrigin: '0% 50%' }, 0.8)
      .from(['.hero__eyebrow', '.hero__lead', '.hero__actions', '.hero__meta'], { y: 24, opacity: 0, duration: DUR.base, stagger: 0.08 }, 0.9)

    // Räumliche Tiefe beim Scrollen: Hintergrund langsam, Vordergrund schnell
    const st = { trigger: el, start: 'top top', end: 'bottom top', scrub: true }
    gsap.to('.hero__media', { yPercent: 22, ease: EASE.linear, scrollTrigger: st })
    gsap.to('.hero__fg', { yPercent: -10, scale: 1.08, ease: EASE.linear, scrollTrigger: st })
    gsap.to('.hero__content', { yPercent: -30, opacity: 0, ease: EASE.linear, scrollTrigger: { ...st, end: '70% top' } })
    // Übergabe: Der Punkt wandert exakt an die Startposition der Wachstumsszene
    const wrap = el.querySelector<HTMLElement>('.hero__dot-wrap')!
    const dot = el.querySelector<HTMLElement>('.hero__dot')!
    const target = () => {
      const W = window.innerWidth
      const H = Math.max(window.innerHeight, 560)
      const k = Math.max(W / 1600, H / 1000)
      return { x: (W - 1600 * k) / 2 + 800 * k, y: (H - 1000 * k) / 2 + 150 * k, d: 30 * k }
    }
    gsap.to(wrap, {
      x: () => target().x - wrap.offsetLeft,
      y: () => target().y - wrap.offsetTop + el.offsetHeight,
      scale: () => target().d / dot.offsetWidth,
      ease: EASE.linear,
      scrollTrigger: { ...st, invalidateOnRefresh: true },
    })
    gsap.to('.hero__ring', { opacity: 0, scale: 0.4, ease: EASE.linear, scrollTrigger: { ...st, end: '55% top' } })
    gsap.to('.hero__dot-m', { opacity: 0, ease: EASE.linear, scrollTrigger: { trigger: el, start: 'bottom 3%', end: 'bottom top', scrub: true } })

    if (!desktop) return
    // Dezente Mausparallaxe nur auf Desktop
    const layers = [
      { el: '.hero__img-m', f: -14 },
      { el: '.hero__dot-m', f: 8 },
      { el: '.hero__fg-m', f: 36 },
    ].map((l) => ({
      x: gsap.quickTo(l.el, 'x', { duration: 1.2, ease: 'power3.out' }),
      y: gsap.quickTo(l.el, 'y', { duration: 1.2, ease: 'power3.out' }),
      f: l.f,
    }))
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      layers.forEach((l) => {
        l.x(nx * l.f)
        l.y(ny * l.f)
      })
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  })

  return (
    <section id="top" ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero__media">
        <div className="hero__img-m">
          <Img
            name="hero"
            className="hero__img"
            priority
            alt="Moderner Garten mit gepflegter Rasenfläche und altem Baum in der Abenddämmerung"
          />
        </div>
        <div className="hero__shade" aria-hidden="true" />
      </div>

      <div className="hero__dot-wrap" aria-hidden="true">
        <div className="hero__dot-m">
          <span className="hero__ring" />
          <span className="hero__ring" />
          <span className="hero__dot" />
        </div>
      </div>

      <div className="hero__content container">
        <p className="hero__eyebrow chapter">
          <span>01</span> Gartenbau &amp; Gartenpflege
        </p>
        <Lines as="h1" id="hero-title" className="hero__title display" lines={['Grosses beginnt', 'mit einem Punkt.']} reveal={false} />
        <p className="hero__lead lead">Wir gestalten Gärten und pflegen, was dir wichtig ist.</p>
        <div className="hero__actions">
          <LinkButton href="#kontakt" variant="primary">
            Gartenprojekt besprechen
          </LinkButton>
          <LinkButton href="#leistungen" variant="ghost">
            Unsere Leistungen
          </LinkButton>
        </div>
      </div>

      <div className="hero__meta container" aria-hidden="true">
        <span className="hero__scroll">
          <span className="hero__scroll-line" /> Scrollen und wachsen lassen
        </span>
        <span>01 / 07</span>
      </div>

      <svg className="hero__fg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="frond-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0B2118" />
            <stop offset="1" stopColor="#24563A" />
          </linearGradient>
          <linearGradient id="frond-b" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0B2118" />
            <stop offset="1" stopColor="#1A4430" />
          </linearGradient>
        </defs>
        <g className="hero__fg-m">
          <Foliage fronds={LEFT} className="hero__fg-l" />
          <Foliage fronds={RIGHT} className="hero__fg-r" />
        </g>
      </svg>
    </section>
  )
}
