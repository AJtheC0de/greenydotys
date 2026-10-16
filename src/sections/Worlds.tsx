import { useId, useRef, useState } from 'react'
import { Img } from '../components/Img'
import { Lines } from '../components/Lines'
import { useMotion, gsap, EASE } from '../lib/motion'

function BeforeAfter() {
  const [value, setValue] = useState(50)
  const id = useId()
  return (
    <figure className="ba" data-fade>
      <div className="ba__frame" style={{ ['--p' as string]: value / 100 }}>
        <Img name="garden" className="ba__img" alt="Gestaltungsvisualisierung nachher: Gartenweg zwischen geschnittenen Hecken mit Sitzplatz unter einem Schirm" sizes="(min-width: 1280px) 1200px, 100vw" />
        <div className="ba__before">
          <Img name="garden-sketch" className="ba__img" alt="Gestaltungsvisualisierung vorher: derselbe Garten als Entwurfsskizze" sizes="(min-width: 1280px) 1200px, 100vw" />
        </div>
        <span className="ba__tag ba__tag--l" aria-hidden="true">Entwurf</span>
        <span className="ba__tag ba__tag--r" aria-hidden="true">Garten</span>
        <input
          id={id}
          className="ba__range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-describedby={`${id}-cap`}
          aria-valuetext={`${value} Prozent Entwurf sichtbar`}
        />
        <label htmlFor={id} className="visually-hidden">
          Vergleich zwischen Entwurf und fertigem Garten verschieben
        </label>
        <span className="ba__handle" aria-hidden="true">
          <span className="ba__knob">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M9 6 L3 12 L9 18 M15 6 L21 12 L15 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </div>
      <figcaption id={`${id}-cap`} className="ba__cap">
        <span className="badge">Gestaltungsvisualisierung</span>
        Kein realisiertes Kundenprojekt. Links eine Entwurfsskizze, rechts die angestrebte Stimmung. Regler mit Maus, Finger oder Pfeiltasten bewegen.
      </figcaption>
    </figure>
  )
}

const MOTIFS = [
  { img: 'ankommen', title: 'Ein Ort zum Ankommen.', alt: 'Gepflasterter Gartenweg zwischen üppigen Beeten', speed: 8, cls: 'm1' },
  { img: 'zusammen', title: 'Raum zum Zusammensein.', alt: 'Blühender Garten vor einem Steinhaus mit grosser Rasenfläche', speed: 14, cls: 'm2' },
  { img: 'bleiben', title: 'Grün, das bleiben darf.', alt: 'Naturnaher, dicht bewachsener Garten mit Gräsern und Moos', speed: 20, cls: 'm3' },
]

export function Worlds() {
  const ref = useRef<HTMLElement>(null)

  useMotion(ref, ({ reduce }) => {
    if (reduce) return
    // Bildmotive: Masken öffnen sich, Bilder bewegen sich mit unterschiedlichen Geschwindigkeiten
    gsap.utils.toArray<HTMLElement>('.motif').forEach((m) => {
      const mask = m.querySelector('.motif__mask')
      const img = m.querySelector('img')
      const speed = Number(m.dataset.speed)
      gsap.fromTo(mask, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: EASE.scene,
        scrollTrigger: { trigger: m, start: 'top 82%' },
      })
      gsap.fromTo(img, { yPercent: -speed, scale: 1.2 }, {
        yPercent: speed, scale: 1.12, ease: EASE.linear,
        scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.from(m.querySelectorAll('figcaption > *'), {
        y: 20, opacity: 0, duration: 0.9, stagger: 0.08, ease: EASE.reveal,
        scrollTrigger: { trigger: m, start: 'top 60%' },
      })
    })
  })

  return (
    <section id="gartenwelten" ref={ref} className="worlds" aria-labelledby="worlds-title">
      <div className="container">
        <header className="worlds__head">
          <p className="chapter">
            <span>04</span> Gartenwelten
          </p>
          <Lines id="worlds-title" className="h2" lines={['Platz für dein', 'Stück Natur.']} />
          <p className="worlds__intro" data-fade>
            Jeder Garten beginnt mit einer Vorstellung. Zieh den Regler und sieh, wie aus ein paar Linien ein Ort wird, an dem man gerne ist.
          </p>
        </header>

        <BeforeAfter />

        <div className="motifs">
          {MOTIFS.map((m, i) => (
            <figure key={m.img} className={`motif motif--${m.cls}`} data-speed={m.speed}>
              <div className="motif__mask">
                <Img name={m.img} alt={m.alt} sizes="(min-width: 1024px) 45vw, 100vw" />
              </div>
              <figcaption>
                <span className="caption">4.{i + 1}</span>
                <span className="motif__title">{m.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
