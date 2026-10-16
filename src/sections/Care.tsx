import { useRef, useState } from 'react'
import { Lines } from '../components/Lines'
import { LinkButton } from '../components/Button'
import { EASE, gsap, useMotion } from '../lib/motion'

type Season = 'spring' | 'summer' | 'autumn' | 'winter'

const SEASONS: { key: Season; label: string; desc: string }[] = [
  { key: 'spring', label: 'Frühling', desc: 'Zweig im Frühling mit zarten Blüten und jungen, hellgrünen Blättern' },
  { key: 'summer', label: 'Sommer', desc: 'Derselbe Zweig im Sommer mit dichtem, sattgrünem Laub' },
  { key: 'autumn', label: 'Herbst', desc: 'Derselbe Zweig im Herbst mit orangem und braunem Laub, einzelne Blätter fallen' },
  { key: 'winter', label: 'Winter', desc: 'Derselbe Zweig im Winter, kahl, mit Schnee auf der Rinde und ruhenden Knospen' },
]

const MAIN = 'M30 560 C 140 500, 220 440, 300 350 C 370 270, 450 200, 570 90'
const TWIGS = [
  'M190 470 C 200 420, 190 380, 160 340',
  'M300 350 C 330 330, 380 330, 420 350',
  'M370 275 C 360 230, 330 200, 300 180',
  'M450 200 C 490 210, 520 240, 540 280',
  'M250 405 C 280 420, 320 450, 330 490',
]
const ANCHORS: [number, number, number][] = [
  [160, 340, -120], [175, 385, -160], [195, 430, -20], [420, 350, 10], [385, 335, -60],
  [350, 338, 60], [300, 180, -140], [330, 205, -80], [355, 240, -170], [540, 280, 60],
  [510, 235, -20], [480, 205, 80], [330, 490, 90], [305, 445, 20], [285, 420, 140],
  [570, 90, -40], [540, 115, -110], [510, 140, 30], [250, 400, -110], [120, 520, -80],
]
const LEAF = 'M0 0 C 10 -16, 34 -18, 50 0 C 34 16, 10 16, 0 0Z'

const PALETTE: Record<Season, { leaves: string[]; scale: number; keep: (i: number) => boolean; bark: string; sun: string; sunO: number }> = {
  spring: { leaves: ['#B9EE78', '#9FD866'], scale: 0.55, keep: (i) => i % 2 === 0, bark: '#5A4433', sun: '#B9EE78', sunO: 0.22 },
  summer: { leaves: ['#2E6B3F', '#3F8A4C', '#4E9B55', '#B9EE78'], scale: 1, keep: () => true, bark: '#5A4433', sun: '#F2D27A', sunO: 0.22 },
  autumn: { leaves: ['#C7772F', '#D9A441', '#A88364', '#9B4A2A'], scale: 0.95, keep: (i) => i % 3 !== 1, bark: '#4E3B2D', sun: '#A88364', sunO: 0.3 },
  winter: { leaves: [], scale: 0, keep: () => false, bark: '#4A3A30', sun: '#DDE6E3', sunO: 0.14 },
}

function Branch({ season }: { season: Season }) {
  const p = PALETTE[season]
  return (
    <svg viewBox="0 0 600 600" className="branch">
      <circle cx="330" cy="300" r="230" fill={p.sun} opacity={p.sunO} />
      <g className="branch__sway">
        <path d={MAIN} stroke={p.bark} strokeWidth="11" strokeLinecap="round" fill="none" />
        {TWIGS.map((d, i) => (
          <path key={i} d={d} stroke={p.bark} strokeWidth="5" strokeLinecap="round" fill="none" />
        ))}
        {ANCHORS.map(([x, y, r], i) =>
          p.keep(i) ? (
            <path key={i} d={LEAF} fill={p.leaves[i % p.leaves.length]} transform={`translate(${x} ${y}) rotate(${r}) scale(${p.scale})`} />
          ) : null,
        )}
        {season === 'spring' &&
          ANCHORS.filter((_, i) => i % 2 === 1).map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 7} cy={Math.sin((a * Math.PI) / 180) * 7} r="6.5" fill="#F8E7EC" />
              ))}
              <circle r="3.5" fill="#E8B86A" />
            </g>
          ))}
        {season === 'autumn' &&
          [
            [220, 540, 30],
            [420, 470, -50],
            [480, 560, 110],
          ].map(([x, y, r], i) => <path key={i} d={LEAF} fill={i % 2 ? '#D9A441' : '#C7772F'} opacity="0.9" transform={`translate(${x} ${y}) rotate(${r}) scale(0.8)`} />)}
        {season === 'winter' && (
          <>
            <path d={MAIN} transform="translate(0 -6)" stroke="#FBFAF6" strokeWidth="5" strokeLinecap="round" strokeDasharray="60 24 30 40" fill="none" />
            {TWIGS.map((d, i) => (
              <path key={i} d={d} transform="translate(0 -4)" stroke="#FBFAF6" strokeWidth="3" strokeLinecap="round" strokeDasharray="22 18" fill="none" />
            ))}
            {ANCHORS.filter((_, i) => i % 3 === 0).map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="4.5" fill="#7A5A40" />
            ))}
          </>
        )}
      </g>
    </svg>
  )
}

const CARE = ['Regelmässiger Gartenunterhalt', 'Rasenpflege', 'Hecken- und Sträucherschnitt', 'Saisonale Gartenarbeiten']

export function Care() {
  const ref = useRef<HTMLElement>(null)
  const [season, setSeason] = useState(0)

  useMotion(ref, ({ desktop, reduce }, el) => {
    if (reduce) return
    el.classList.add('is-motion')
    const layers = gsap.utils.toArray<HTMLElement>('.season')
    gsap.set(layers.slice(1), { opacity: 0 })

    const tl = gsap.timeline({
      defaults: { ease: EASE.linear },
      scrollTrigger: desktop
        ? {
            trigger: el,
            start: 'top top',
            end: '+=240%',
            pin: '.care__stage',
            scrub: 0.6,
            onUpdate: (s) => setSeason(Math.min(3, Math.floor(s.progress * 4))),
          }
        : {
            trigger: '.care__visual',
            start: 'top 75%',
            end: 'bottom 15%',
            scrub: 0.6,
            onUpdate: (s) => setSeason(Math.min(3, Math.floor(s.progress * 4))),
          },
    })
    layers.forEach((layer, i) => {
      if (i === 0) return
      // weiche saisonale Überblendung mit leichtem Atmen der Form
      tl.to(layer, { opacity: 1, duration: 1, ease: EASE.scene }, i * 1.5 - 0.6)
        .fromTo(layer.querySelector('svg'), { scale: 1.04 }, { scale: 1, duration: 1, ease: EASE.scene }, i * 1.5 - 0.6)
        .to(layers[i - 1], { opacity: 0, duration: 1, ease: EASE.scene }, i * 1.5 - 0.6)
    })
    tl.fromTo('.branch__sway', { rotation: -3, svgOrigin: '30 560' }, { rotation: 2, svgOrigin: '30 560', duration: tl.duration() }, 0)
    tl.to('.care__ticks-bar', { scaleX: 1, duration: tl.duration() }, 0)

    return () => el.classList.remove('is-motion')
  })

  return (
    <section id="pflege" ref={ref} className="care theme-dark" aria-labelledby="care-title">
      <div className="care__stage container">
        <div className="care__text">
          <p className="chapter chapter--light">
            <span>05</span> Pflege
          </p>
          <Lines id="care-title" className="h2" lines={['Schön angelegt.', 'Liebevoll gepflegt.']} />
          <p className="care__body" data-fade>
            Ein Garten verändert sich. Wir begleiten ihn dabei – mit regelmässiger Pflege, fachgerechtem Rückschnitt und einem Blick für das, was gerade gebraucht wird.
          </p>
          <ul className="care__list" data-fade>
            {CARE.map((c) => (
              <li key={c}>
                <span className="care__bullet" aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
          <div data-fade>
            <LinkButton
              href="#kontakt"
              variant="primary"
              onClick={() => window.dispatchEvent(new CustomEvent('greendot:interest', { detail: 'Gartenpflege' }))}
            >
              Gartenpflege anfragen
            </LinkButton>
          </div>
        </div>

        <div className="care__visual">
          <div className="care__seasons">
            {SEASONS.map((s) => (
              <figure key={s.key} className={`season season--${s.key}`} role="img" aria-label={s.desc}>
                <Branch season={s.key} />
                <figcaption className="season__label" aria-hidden="true">
                  {s.label}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="care__ticks" aria-hidden="true">
            <span className="care__ticks-track">
              <span className="care__ticks-bar" />
            </span>
            <ol>
              {SEASONS.map((s, i) => (
                <li key={s.key} className={i === season ? 'is-active' : undefined}>
                  {s.label}
                </li>
              ))}
            </ol>
          </div>
          <p className="caption care__caption">Ein Zweig, vier Jahreszeiten · Illustration</p>
        </div>
      </div>
    </section>
  )
}
