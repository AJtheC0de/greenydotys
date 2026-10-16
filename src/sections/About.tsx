import { useRef } from 'react'
import { Img } from '../components/Img'
import { Lines } from '../components/Lines'
import { EASE, gsap, useMotion } from '../lib/motion'

const STEPS = [
  { title: 'Kennenlernen', text: 'Wir kommen vorbei, schauen uns deinen Garten an und hören zu: Wie lebst du draussen, was ist dir wichtig?' },
  { title: 'Gemeinsam planen', text: 'Aus deinen Wünschen entsteht ein klares Konzept mit Pflanzen, Materialien und einem verständlichen Ablauf.' },
  { title: 'Garten gestalten und pflegen', text: 'Wir setzen um – und begleiten deinen Garten auf Wunsch auch danach, Saison für Saison.' },
]

export function About() {
  const ref = useRef<HTMLElement>(null)

  useMotion(ref, ({ reduce }) => {
    if (reduce) return
    gsap.fromTo('.process__line-fill', { scaleY: 0 }, {
      scaleY: 1, ease: EASE.linear,
      scrollTrigger: { trigger: '.process', start: 'top 70%', end: 'bottom 55%', scrub: true },
    })
    gsap.utils.toArray<HTMLElement>('.process__step').forEach((step) => {
      gsap.from(step, {
        opacity: 0.25, x: -12, duration: 0.8, ease: EASE.reveal,
        scrollTrigger: { trigger: step, start: 'top 72%', toggleActions: 'play none none reverse' },
      })
    })
  })

  return (
    <section id="ueber-uns" ref={ref} className="about" aria-labelledby="about-title">
      <div className="container about__grid">
        <figure className="about__fig">
          <div className="about__mask" data-mask>
            <Img name="haende" alt="Hände in Arbeitshandschuhen halten einen jungen Setzling mit Wurzelballen und Erde" sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
          <figcaption className="caption">Handarbeit mit Erde, Pflanze und Zeit</figcaption>
        </figure>

        <div className="about__text">
          <p className="chapter">
            <span>06</span> Über greendot
          </p>
          <Lines id="about-title" className="h2" lines={['Gute Gärten', 'beginnen mit', 'Zuhören.']} />
          <p className="lead about__lead" data-fade>
            Wie möchtest du deinen Garten nutzen? Was soll wachsen, was darf sich verändern? Wir hören zu, denken mit und gestalten einen Aussenraum, der zu dir passt.
          </p>

          <ol className="process" aria-label="So arbeiten wir">
            <span className="process__line" aria-hidden="true">
              <span className="process__line-fill" />
            </span>
            {STEPS.map((s, i) => (
              <li key={s.title} className="process__step">
                <span className="process__num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 className="process__title">{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="placeholder" data-fade>
            <strong>Platzhalter:</strong> Hier folgen Angaben zu Team, Standort und Einzugsgebiet von greendot.
          </p>
        </div>
      </div>
    </section>
  )
}
