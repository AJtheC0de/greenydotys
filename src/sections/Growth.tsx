import { useMemo, useRef } from 'react'
import { Img } from '../components/Img'
import { EASE, gsap, useMotion } from '../lib/motion'

/* ---------- Generative, aber deterministische Wurzeln ---------- */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

type Root = { d: string; w: number; depth: number }

function makeRoots(): Root[] {
  const r = rng(11)
  const out: Root[] = []
  const grow = (x: number, y: number, a: number, len: number, w: number, depth: number) => {
    if (depth > 3) return
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`
    let cx = x
    let cy = y
    let ang = a
    for (let i = 0; i < 3; i++) {
      ang += (r() - 0.5) * 0.55
      const nx = cx + (Math.cos(ang) * len) / 3
      const ny = Math.min(990, cy + (Math.sin(ang) * len) / 3)
      const mx = (cx + nx) / 2 + (r() - 0.5) * 16
      const my = (cy + ny) / 2 + (r() - 0.5) * 10
      d += ` Q${mx.toFixed(1)} ${my.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`
      cx = nx
      cy = ny
    }
    out.push({ d, w, depth })
    const kids = depth === 0 ? 3 : 2
    for (let k = 0; k < kids; k++) {
      const spread = (k / Math.max(1, kids - 1) - 0.5) * 1.3 + (r() - 0.5) * 0.3
      grow(cx, cy, ang + spread, len * (0.62 + r() * 0.12), w * 0.62, depth + 1)
    }
  }
  ;[-1.05, -0.5, 0, 0.5, 1.05].forEach((o, i) => grow(800, 578, Math.PI / 2 + o, 150 + (i % 2) * 40, 3.2, 0))
  return out
}

/* ---------- Pflanze ---------- */
const LEAF = 'M0 0 C 26 -30, 86 -38, 130 -6 C 90 22, 30 24, 0 0Z'
const VEIN = 'M6 -1 C 40 -8, 80 -10, 122 -6'
const LEAVES = [
  { x: 801, y: 515, r: -160, s: 1.05 },
  { x: 806, y: 462, r: -22, s: 1.15 },
  { x: 799, y: 408, r: -150, s: 1.1 },
  { x: 807, y: 356, r: -30, s: 1 },
  { x: 802, y: 310, r: -142, s: 0.9 },
  { x: 804, y: 272, r: -118, s: 1.25 },
  { x: 804, y: 272, r: -58, s: 1.25 },
]

const GRASS = Array.from({ length: 70 }, (_, i) => {
  const r = rng(i + 3)
  const x = (i / 70) * 1600 + r() * 20
  const h = 8 + r() * 16
  return `M${x.toFixed(0)} 558 q ${(r() * 6 - 3).toFixed(1)} ${-h / 2} ${(r() * 8 - 4).toFixed(1)} ${-h}`
}).join(' ')

const PEBBLES = Array.from({ length: 46 }, (_, i) => {
  const r = rng(i * 7 + 1)
  return { cx: r() * 1600, cy: 600 + r() * 390, rx: 3 + r() * 9, ry: 2 + r() * 5, o: 0.12 + r() * 0.25 }
})

/* Gartenwelt am Horizont, wächst gegen Ende der Szene */
const SHRUBS = [
  { x: 380, s: 1.2 },
  { x: 520, s: 0.8 },
  { x: 640, s: 1 },
  { x: 990, s: 0.9 },
  { x: 1110, s: 1.3 },
  { x: 1260, s: 0.85 },
]

export function Growth() {
  const ref = useRef<HTMLElement>(null)
  const roots = useMemo(makeRoots, [])

  useMotion(ref, ({ desktop, reduce }, el) => {
    if (reduce) return
    el.classList.add('is-motion')
    const stage = el.querySelector<HTMLElement>('.growth__stage')!
    const reveal = el.querySelector<HTMLElement>('.growth__reveal')!
    const ring = el.querySelector<HTMLElement>('.growth__ring')!

    // Bildschirmposition des Pflanzenzentrums (viewBox 1600×1000, „slice“)
    const center = () => {
      const W = stage.clientWidth
      const H = stage.clientHeight
      const k = Math.max(W / 1600, H / 1000)
      return { x: (W - 1600 * k) / 2 + 804 * k, y: (H - 1000 * k) / 2 + 330 * k, max: Math.hypot(W, H) }
    }
    // Runde „Linse“ in die Gartenwelt: Bildmaske und Lichtring wachsen gemeinsam
    const lens = { r: 0 }
    const drawLens = () => {
      const c = center()
      reveal.style.clipPath = `circle(${lens.r}px at ${c.x}px ${c.y}px)`
      ring.style.cssText = `left:${c.x}px;top:${c.y}px;width:${lens.r * 2}px;height:${lens.r * 2}px;opacity:${lens.r > 2 && lens.r < c.max * 0.6 ? 1 : 0}`
    }
    drawLens()

    const statements = gsap.utils.toArray<HTMLElement>('.growth__line')
    const bar = el.querySelector('.growth__progress-bar')
    const depthGroups = [0, 1, 2, 3].map((d) => el.querySelectorAll(`.root[data-depth="${d}"]`))

    gsap.set('.root, .stem', { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set('.leaf-i', { scale: 0, rotation: -40, transformOrigin: '0% 50%' })
    gsap.set('.shrub', { scaleY: 0, transformOrigin: '50% 100%' })
    gsap.set(statements, { yPercent: 40, opacity: 0 })

    // Punkt aus dem Hero übernimmt nahtlos
    gsap.fromTo('.g-dot', { opacity: 0 }, { opacity: 1, ease: EASE.linear, scrollTrigger: { trigger: el, start: 'top 3%', end: 'top top', scrub: true } })

    const tl = gsap.timeline({
      defaults: { ease: EASE.linear },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: desktop ? '+=320%' : '+=200%',
        pin: '.growth__stage',
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => bar && gsap.set(bar, { scaleY: self.progress }),
      },
    })

    const say = (i: number, at: number, hold = 1.6) => {
      tl.to(statements[i], { yPercent: 0, opacity: 1, duration: 0.6, ease: EASE.grow }, at)
      if (i < statements.length - 1) tl.to(statements[i], { yPercent: -40, opacity: 0, duration: 0.5, ease: 'power2.in' }, at + hold)
    }

    // 1 · Eine Idee: der Punkt sinkt in die Erde
    say(0, 0, 1.8)
    tl.fromTo('.g-dot', { y: 0 }, { y: 428, duration: 1.4, ease: 'power2.in' }, 0.2)
      .to('.g-dot', { scale: 0.62, transformOrigin: '50% 50%', duration: 0.4 }, 1.3)
      .from('.g-seed-glow', { opacity: 0, scale: 0.3, transformOrigin: '50% 50%', duration: 0.6 }, 1.5)
      .to('.g-sky-glow', { opacity: 0.35, duration: 1 }, 1.2)

    // 2 · Neue Wurzeln
    say(1, 2.2, 1.9)
    depthGroups.forEach((g, d) => tl.to(g, { strokeDashoffset: 0, duration: 1.1, stagger: 0.04, ease: EASE.grow }, 1.9 + d * 0.45))

    // 3 · Trieb und Blätter
    tl.to('.stem', { strokeDashoffset: 0, duration: 1.6, ease: EASE.grow }, 3.6)
    gsap.utils.toArray<SVGGElement>('.leaf-i').forEach((leaf, i) =>
      tl.to(leaf, { scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.6)' }, 3.95 + i * 0.2),
    )

    // 4 · Kamera fährt in die Gartenwelt
    tl.to('.shrub', { scaleY: 1, duration: 1, stagger: 0.08, ease: EASE.grow }, 5.2)
      .to('.g-cam', { scale: 2.4, svgOrigin: '804 330', duration: 2.2, ease: EASE.scene }, 5.6)
      .to('.g-hills-far', { y: -40, duration: 2.2, ease: EASE.scene }, 5.6)
      .to('.g-soil', { y: 120, duration: 2.2, ease: EASE.scene }, 5.6)
      .fromTo(lens, { r: 0 }, { r: () => center().max, duration: 1.8, ease: 'power2.in', onUpdate: drawLens }, 6.7)
      .fromTo('.growth__reveal img', { scale: 1.35 }, { scale: 1, duration: 2.2, ease: EASE.scene }, 6.7)
    say(2, 7.4)
    tl.to({}, { duration: 0.8 }, 8.6) // kurze Ruhe am Ende

    window.addEventListener('resize', drawLens)
    return () => {
      window.removeEventListener('resize', drawLens)
      el.classList.remove('is-motion')
      reveal.style.clipPath = ''
    }
  })

  return (
    <section id="wachstum" ref={ref} className="growth" aria-labelledby="growth-title">
      <div className="growth__stage">
        <svg className="growth__svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="growth-svg-title">
          <title id="growth-svg-title">Illustration: Ein Samen in der Erde bildet Wurzeln, ein Trieb wächst und entfaltet Blätter.</title>
          <defs>
            <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0B2118" />
              <stop offset="1" stopColor="#163D2A" />
            </linearGradient>
            <radialGradient id="g-glow">
              <stop offset="0" stopColor="#B9EE78" stopOpacity="0.55" />
              <stop offset="1" stopColor="#B9EE78" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="g-leaf" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#3E8A4E" />
              <stop offset="1" stopColor="#B9EE78" />
            </linearGradient>
            <linearGradient id="g-stem" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#4F8F4A" />
              <stop offset="1" stopColor="#B9EE78" />
            </linearGradient>
          </defs>

          <rect width="1600" height="1000" fill="url(#g-sky)" />
          <circle className="g-sky-glow" cx="804" cy="330" r="420" fill="url(#g-glow)" opacity="0.15" />

          <g className="g-cam">
            <path className="g-hills-far" d="M0 470 C 200 420 380 444 560 412 C 760 378 920 432 1100 402 C 1300 368 1450 420 1600 396 L1600 600 L0 600Z" fill="#123422" />
            <g className="g-shrubs">
              {SHRUBS.map((s, i) => (
                <g key={i} transform={`translate(${s.x} 545) scale(${s.s})`}>
                  <g className="shrub">
                    <circle cx="0" cy="-34" r="34" fill="#1E4B33" />
                    <circle cx="-26" cy="-18" r="24" fill="#245A3C" />
                    <circle cx="28" cy="-20" r="26" fill="#1A4430" />
                  </g>
                </g>
              ))}
            </g>
            <path d="M0 520 C 180 482 340 506 520 486 C 700 466 860 512 1040 490 C 1240 468 1420 500 1600 482 L1600 600 L0 600Z" fill="#163D2A" />

            <g className="g-soil">
              <path d="M0 556 C 260 548 520 566 800 558 C 1080 550 1340 566 1600 556 L1600 1100 L0 1100Z" fill="#5E4635" />
              <path d="M0 650 C 300 636 560 668 820 652 C 1100 636 1360 662 1600 648 L1600 1100 L0 1100Z" fill="#47352A" />
              <path d="M0 770 C 280 756 600 786 860 770 C 1120 754 1380 782 1600 768 L1600 1100 L0 1100Z" fill="#33261D" />
              <path d="M0 888 C 320 876 640 900 900 888 C 1160 876 1400 898 1600 886 L1600 1100 L0 1100Z" fill="#241B15" />
              {PEBBLES.map((p, i) => (
                <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="#A88364" opacity={p.o} />
              ))}
              <path d={GRASS} stroke="#2C5A3A" strokeWidth="3" strokeLinecap="round" fill="none" />
              <g className="g-roots" fill="none" strokeLinecap="round">
                {roots.map((r, i) => (
                  <path key={i} className="root" data-depth={r.depth} d={r.d} pathLength={1} stroke="#E9DFC9" strokeOpacity={0.85 - r.depth * 0.12} strokeWidth={r.w} />
                ))}
              </g>
              <circle className="g-seed-glow" cx="800" cy="578" r="60" fill="url(#g-glow)" />
            </g>

            <path className="stem" d="M800 574 C 796 520, 812 470, 802 420 C 792 370, 812 320, 804 272" pathLength={1} stroke="url(#g-stem)" strokeWidth="7" strokeLinecap="round" fill="none" />
            {LEAVES.map((l, i) => (
              <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}>
                <g className="leaf-i">
                  <path d={LEAF} fill="url(#g-leaf)" />
                  <path d={VEIN} stroke="#163D2A" strokeOpacity="0.45" strokeWidth="2" fill="none" />
                </g>
              </g>
            ))}
            <g className="g-dot">
              <circle cx="800" cy="150" r="34" fill="url(#g-glow)" />
              <circle cx="800" cy="150" r="15" fill="#B9EE78" />
            </g>
          </g>
        </svg>

        <div className="growth__reveal" aria-hidden="true">
          <Img name="gruen" alt="" sizes="100vw" />
          <div className="growth__reveal-shade" />
        </div>

        <span className="growth__ring" aria-hidden="true" />

        <div className="growth__copy container">
          <p className="chapter chapter--light">
            <span>02</span> Wachstum
          </p>
          <h2 id="growth-title" className="visually-hidden">
            Wie aus einer Idee ein Garten wächst
          </h2>
          <ol className="growth__lines">
            <li className="growth__line">Eine Idee.</li>
            <li className="growth__line">Neue Wurzeln.</li>
            <li className="growth__line">Mehr Raum zum Leben.</li>
          </ol>
        </div>

        <div className="growth__progress" aria-hidden="true">
          <span className="growth__progress-bar" />
        </div>
      </div>
    </section>
  )
}
