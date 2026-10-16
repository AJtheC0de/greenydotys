import { useRef, useState } from 'react'
import { Img } from '../components/Img'
import { Lines } from '../components/Lines'
import { EASE, gsap, prefersReducedMotion, useMotion } from '../lib/motion'

const SERVICES = [
  {
    title: 'Gartenbau',
    text: 'Aus deinen Ideen entsteht ein Garten, der zu deinem Leben passt.',
    tags: ['Planung', 'Wege & Plätze', 'Beete'],
    img: 'bau',
    alt: 'Hochbeete aus Holz mit Mangold und Kräutern in einem sonnigen Garten',
  },
  {
    title: 'Gartenpflege',
    text: 'Damit dein Garten gesund wächst und dauerhaft Freude macht.',
    tags: ['Unterhalt', 'Rasen', 'Saisonarbeiten'],
    img: 'pflege',
    alt: 'Dichter, frisch gemähter Rasen im weichen Licht',
  },
  {
    title: 'Bepflanzung',
    text: 'Farben, Formen und Pflanzen, die miteinander harmonieren.',
    tags: ['Stauden', 'Gehölze', 'Jungpflanzen'],
    img: 'pflanz',
    alt: 'Eine Hand setzt junge Setzlinge in Anzuchttöpfe mit dunkler Erde',
  },
  {
    title: 'Hecken- und Gehölzschnitt',
    text: 'Sorgfältige Pflege für gesunde Pflanzen und klare Konturen.',
    tags: ['Formschnitt', 'Rückschnitt', 'Sträucher'],
    img: 'hecke',
    alt: 'Hände in Arbeitshandschuhen schneiden einen Nadelgehölzzweig mit der Gartenschere',
  },
]

/** Gartenplan von oben: wächst mit jeder Leistung um eine Ebene. */
function Plan() {
  return (
    <svg className="plan" viewBox="0 0 300 300" aria-hidden="true">
      <rect x="10" y="10" width="280" height="280" rx="18" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="4 6" />
      {/* 0 · Gartenbau: Terrasse und Weg */}
      <g className="plan-s plan-s0">
        <rect className="plan-fill" x="190" y="200" width="82" height="72" rx="6" fill="#D8CDB6" />
        <path className="plan-line" pathLength={1} d="M40 272 C 60 220, 140 230, 150 180 S 200 110, 230 60" fill="none" stroke="#A88364" strokeWidth="12" strokeLinecap="round" />
        <path className="plan-line" pathLength={1} d="M190 200 h82 v72 h-82z" fill="none" stroke="#7A5A40" strokeWidth="1.5" />
      </g>
      {/* 1 · Gartenpflege: Rasen mit Mähstreifen */}
      <g className="plan-s plan-s1">
        <path className="plan-fill" d="M40 60 C 90 40, 150 50, 170 90 C 185 125, 120 170, 80 190 C 50 205, 30 150, 40 60Z" fill="#9FCB72" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} className="plan-line" pathLength={1} d={`M${50 + i * 20} 62 L${40 + i * 18} 190`} stroke="#7FB255" strokeWidth="6" />
        ))}
      </g>
      {/* 2 · Bepflanzung */}
      <g className="plan-s plan-s2">
        {[
          [205, 120, 16, '#E7A6B4'], [232, 140, 12, '#F2D27A'], [214, 158, 10, '#B9EE78'],
          [70, 236, 15, '#C8A3E0'], [100, 254, 11, '#F2D27A'], [128, 238, 9, '#E7A6B4'],
          [250, 100, 9, '#B9EE78'], [186, 152, 8, '#C8A3E0'],
        ].map(([cx, cy, r, c], i) => (
          <circle key={i} className="plan-dot" cx={cx} cy={cy} r={r} fill={c as string} />
        ))}
      </g>
      {/* 3 · Hecken und Gehölze */}
      <g className="plan-s plan-s3">
        <path className="plan-line" pathLength={1} d="M24 24 H276" stroke="#163D2A" strokeWidth="14" strokeLinecap="round" />
        <path className="plan-line" pathLength={1} d="M24 24 V200" stroke="#163D2A" strokeWidth="14" strokeLinecap="round" />
        {[
          [262, 186],
          [34, 250],
        ].map(([cx, cy], i) => (
          <circle key={i} className="plan-dot" cx={cx} cy={cy} r="16" fill="#245A3C" />
        ))}
      </g>
    </svg>
  )
}

export function Services() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useMotion(ref, ({ desktop, reduce }, el) => {
    if (reduce) return
    const items = gsap.utils.toArray<HTMLElement>('.svc__item')
    const steps = gsap.utils.toArray<SVGGElement>('.plan-s')

    const drawStep = (tl: gsap.core.Timeline, step: Element, at: number) => {
      const lines = step.querySelectorAll('.plan-line')
      const fills = step.querySelectorAll('.plan-fill')
      const dots = step.querySelectorAll('.plan-dot')
      if (lines.length) tl.fromTo(lines, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, stagger: 0.05, ease: EASE.grow }, at)
      if (fills.length) tl.fromTo(fills, { opacity: 0 }, { opacity: 1, duration: 0.6 }, at + 0.1)
      if (dots.length) tl.fromTo(dots, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, stagger: 0.04, ease: 'back.out(2)' }, at + 0.2)
    }

    if (!desktop) {
      // Mobile: vertikale Abschnitte, jeder mit eigenem Bild-Reveal
      items.forEach((item) => {
        gsap.fromTo(
          item.querySelector('.svc__fig'),
          { clipPath: 'inset(18% 8% 18% 8% round 24px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: EASE.linear, scrollTrigger: { trigger: item, start: 'top 90%', end: 'top 35%', scrub: true } },
        )
        gsap.from(item.querySelectorAll('.svc__text > *'), {
          y: 28, opacity: 0, duration: 0.9, stagger: 0.07, ease: EASE.reveal,
          scrollTrigger: { trigger: item.querySelector('.svc__text'), start: 'top 88%' },
        })
      })
      return
    }

    el.classList.add('is-pinned')
    const bar = el.querySelector('.svc__progress-bar')
    const tl = gsap.timeline({
      defaults: { ease: EASE.scene },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: `+=${items.length * 85}%`,
        pin: '.svc__stage',
        scrub: 0.6,
        onUpdate: (self) => {
          const i = Math.min(items.length - 1, Math.floor(self.progress * items.length * 0.999 + 0.25))
          setActive((a) => (a === i ? a : i))
          if (bar) gsap.set(bar, { scaleX: self.progress })
        },
      },
    })

    items.forEach((item, i) => {
      const fig = item.querySelector('.svc__fig')
      const img = item.querySelector('.svc__fig img')
      const text = item.querySelectorAll('.svc__text > *')
      tl.addLabel(`s${i}`, i * 2)
      if (i === 0) {
        gsap.set(text, { opacity: 1 })
        drawStep(tl, steps[0], 0)
        tl.fromTo(img, { scale: 1.15 }, { scale: 1, duration: 2, ease: EASE.linear }, 0)
        return
      }
      const prevText = items[i - 1].querySelectorAll('.svc__text > *')
      const at = i * 2 - 0.9
      tl.to(prevText, { yPercent: -60, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power2.in' }, at)
        .fromTo(fig, { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.1 }, at)
        .fromTo(img, { scale: 1.3, yPercent: 8 }, { scale: 1, yPercent: 0, duration: 2, ease: EASE.grow }, at)
        .fromTo(text, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: EASE.grow, immediateRender: true }, at + 0.45)
      drawStep(tl, steps[i], at + 0.3)
    })
    tl.addLabel('end').to({}, { duration: 0.6 })
    tlRef.current = tl

    return () => {
      el.classList.remove('is-pinned')
      tlRef.current = null
    }
  })

  const goTo = (i: number) => {
    const tl = tlRef.current
    if (!tl?.scrollTrigger) return
    const st = tl.scrollTrigger
    const label = i === 0 ? 0 : tl.labels[`s${i}`] + 0.3
    const top = st.start + (st.end - st.start) * (label / tl.duration())
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  return (
    <section id="leistungen" ref={ref} className="svc" aria-labelledby="svc-title">
      <div className="svc__edge" aria-hidden="true">
        <svg viewBox="0 0 1600 120" preserveAspectRatio="none">
          <path d="M0 120 L0 70 C 260 10, 520 0, 800 40 C 1080 80, 1340 70, 1600 20 L1600 120Z" fill="currentColor" />
        </svg>
      </div>
      <div className="svc__stage container">
        <header className="svc__head">
          <p className="chapter">
            <span>03</span> Leistungen
          </p>
          <Lines id="svc-title" className="h2" lines={['Für alles, was', 'draussen zählt.']} />
        </header>

        <div className="svc__items">
          {SERVICES.map((s, i) => (
            <article className="svc__item" key={s.title} aria-labelledby={`svc-${i}`}>
              <figure className="svc__fig">
                <Img name={s.img} alt={s.alt} sizes="(min-width: 1024px) 55vw, 100vw" />
              </figure>
              <div className="svc__text">
                <span className="svc__num">0{i + 1} / 04</span>
                <h3 id={`svc-${i}`} className="svc__title">
                  {s.title}
                </h3>
                <p className="svc__lead">{s.text}</p>
                <ul className="svc__tags" aria-label={`Schwerpunkte ${s.title}`}>
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="svc__plan" aria-hidden="true">
          <Plan />
          <p className="caption">Gartenplan · wächst mit jeder Leistung</p>
        </div>

        <div className="svc__index">
          <div className="svc__progress" aria-hidden="true">
            <span className="svc__progress-bar" />
          </div>
          <ul aria-label="Leistungen im Überblick">
            {SERVICES.map((s, i) => (
              <li key={s.title}>
                <button type="button" className={i === active ? 'is-active' : undefined} aria-current={i === active ? 'step' : undefined} onClick={() => goTo(i)}>
                  <span className="svc__index-dot" aria-hidden="true" />
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
