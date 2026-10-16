import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Lines } from '../components/Lines'
import { Button } from '../components/Button'
import { EASE, gsap, useMotion } from '../lib/motion'

const INTERESTS = ['Gartenbau', 'Gartenpflege', 'Beides'] as const

type Fields = { name: string; email: string; ort: string; interest: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>

const LABELS: Record<keyof Fields, string> = {
  name: 'Name',
  email: 'E-Mail',
  ort: 'Ort',
  interest: 'Interesse',
  message: 'Nachricht',
}

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Bitte gib deinen Namen ein.'
  if (!f.email.trim()) e.email = 'Bitte gib deine E-Mail-Adresse ein.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
    e.email = 'Diese E-Mail-Adresse sieht unvollständig aus – zum Beispiel: name@beispiel.ch'
  if (!f.interest) e.interest = 'Bitte wähle aus, wofür du dich interessierst.'
  if (f.message.trim().length < 10) e.message = 'Erzähl uns kurz von deinem Garten – mindestens 10 Zeichen.'
  return e
}

export function Contact() {
  const ref = useRef<HTMLElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const noticeRef = useRef<HTMLDivElement>(null)
  const [fields, setFields] = useState<Fields>({ name: '', email: '', ort: '', interest: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  // Vorbelegung, wenn z. B. „Gartenpflege anfragen“ geklickt wurde
  useEffect(() => {
    const onInterest = (e: Event) => {
      const v = (e as CustomEvent<string>).detail
      setFields((f) => (f.interest ? f : { ...f, interest: v }))
    }
    window.addEventListener('greendot:interest', onInterest)
    return () => window.removeEventListener('greendot:interest', onInterest)
  }, [])

  useMotion(ref, ({ reduce }) => {
    if (reduce) return
    // Der Punkt aus dem Hero kehrt zurück und wächst zur organischen Fläche
    gsap.fromTo('.contact__blob', { scale: 0.035, yPercent: -30 }, {
      scale: 1, yPercent: 0, ease: EASE.linear,
      scrollTrigger: { trigger: ref.current, start: 'top 85%', end: 'top 5%', scrub: 0.6 },
    })
    gsap.from('.contact__card', {
      y: 60, opacity: 0, duration: 1.1, ease: EASE.reveal,
      scrollTrigger: { trigger: '.contact__card', start: 'top 85%' },
    })
  })

  const set = (k: keyof Fields, v: string) => {
    const next = { ...fields, [k]: v }
    setFields(next)
    setSubmitted(false)
    if (touched[k] || showSummary) setErrors(validate(next))
  }
  const blur = (k: keyof Fields) => {
    setTouched((t) => ({ ...t, [k]: true }))
    setErrors((prev) => {
      const all = validate(fields)
      return { ...prev, [k]: all[k] }
    })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate(fields)
    setErrors(errs)
    setTouched({ name: true, email: true, ort: true, interest: true, message: true })
    if (Object.keys(errs).length) {
      setSubmitted(false)
      setShowSummary(true)
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setShowSummary(false)
    // Kein Backend vorhanden: nichts vortäuschen, sondern klar informieren.
    setSubmitted(true)
    requestAnimationFrame(() => noticeRef.current?.focus())
  }

  const errorKeys = (Object.keys(errors) as (keyof Fields)[]).filter((k) => errors[k])
  const fieldProps = (k: keyof Fields) => ({
    id: `f-${k}`,
    name: k,
    value: fields[k],
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `f-${k}-err` : undefined,
    onBlur: () => blur(k),
  })
  const Err = ({ k }: { k: keyof Fields }) =>
    errors[k] ? (
      <p className="field__error" id={`f-${k}-err`}>
        <span aria-hidden="true">!</span> {errors[k]}
      </p>
    ) : null

  return (
    <section id="kontakt" ref={ref} className="contact" aria-labelledby="contact-title">
      <div className="contact__blob" aria-hidden="true" />
      <div className="container contact__grid">
        <div className="contact__intro">
          <p className="chapter">
            <span>07</span> Kontakt
          </p>
          <Lines id="contact-title" className="h2 contact__title" lines={['Was darf bei', 'dir wachsen?']} />
          <p className="lead" data-fade>
            Erzähl uns von deinem Garten. Gemeinsam finden wir heraus, was möglich ist.
          </p>
          <dl className="contact__direct" data-fade>
            <div>
              <dt>E-Mail</dt>
              <dd className="ph">[E-Mail-Adresse folgt]</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd className="ph">[Telefonnummer folgt]</dd>
            </div>
          </dl>
        </div>

        <div className="contact__card">
          <form className="form" noValidate onSubmit={onSubmit} aria-labelledby="form-title">
            <h3 id="form-title" className="form__title">
              Deine Anfrage
            </h3>
            <p className="form__hint">Felder mit * sind Pflichtfelder.</p>

            {showSummary && errorKeys.length > 0 && (
              <div className="form__summary" ref={summaryRef} tabIndex={-1} role="alert">
                <p>
                  <strong>Bitte prüfe {errorKeys.length === 1 ? 'ein Feld' : `${errorKeys.length} Felder`}:</strong>
                </p>
                <ul>
                  {errorKeys.map((k) => (
                    <li key={k}>
                      <a href={k === 'interest' ? `#f-interest-${INTERESTS[0]}` : `#f-${k}`}>
                        {LABELS[k]}: {errors[k]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form__row">
              <div className={`field${errors.name ? ' has-error' : ''}`}>
                <label htmlFor="f-name">Name *</label>
                <input type="text" autoComplete="name" required {...fieldProps('name')} onChange={(e) => set('name', e.target.value)} />
                <Err k="name" />
              </div>
              <div className={`field${errors.email ? ' has-error' : ''}`}>
                <label htmlFor="f-email">E-Mail *</label>
                <input type="email" autoComplete="email" inputMode="email" required {...fieldProps('email')} onChange={(e) => set('email', e.target.value)} />
                <Err k="email" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="f-ort">
                Ort <span className="field__opt">(optional)</span>
              </label>
              <input type="text" autoComplete="address-level2" {...fieldProps('ort')} onChange={(e) => set('ort', e.target.value)} />
            </div>

            <fieldset className={`field field--choice${errors.interest ? ' has-error' : ''}`} aria-describedby={errors.interest ? 'f-interest-err' : undefined}>
              <legend>Interesse *</legend>
              <div className="choices">
                {INTERESTS.map((v) => (
                  <label key={v} className="choice">
                    <input
                      type="radio"
                      id={`f-interest-${v}`}
                      name="interest"
                      value={v}
                      checked={fields.interest === v}
                      onChange={() => set('interest', v)}
                      onBlur={() => blur('interest')}
                      aria-invalid={errors.interest ? true : undefined}
                    />
                    <span className="choice__ui">
                      <span className="choice__dot" aria-hidden="true" />
                      {v}
                    </span>
                  </label>
                ))}
              </div>
              <Err k="interest" />
            </fieldset>

            <div className={`field${errors.message ? ' has-error' : ''}`}>
              <label htmlFor="f-message">Nachricht *</label>
              <textarea rows={5} required {...fieldProps('message')} onChange={(e) => set('message', e.target.value)} placeholder="Zum Beispiel: Grösse, Lage, Wünsche, Zeitraum" />
              <Err k="message" />
            </div>

            <Button type="submit" variant="forest" className="form__submit">
              Anfrage senden
            </Button>

            <div className={`form__notice${submitted ? ' is-visible' : ''}`} ref={noticeRef} tabIndex={-1} role="status" aria-live="polite">
              {submitted && (
                <>
                  <p>
                    <strong>Danke, {fields.name.trim().split(' ')[0]}! Deine Angaben sind vollständig – aber noch nicht verschickt.</strong>
                  </p>
                  <p>
                    Der Formularversand wird gerade eingerichtet. Deine Nachricht wurde nicht übermittelt und nicht gespeichert. Bitte melde dich vorerst direkt über die Kontaktangaben links.
                  </p>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
