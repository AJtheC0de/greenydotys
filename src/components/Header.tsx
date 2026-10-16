import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Wordmark } from './Wordmark'
import { LinkButton } from './Button'
import { EASE, gsap, prefersReducedMotion } from '../lib/motion'

export const NAV = [
  { href: '#leistungen', label: 'Leistungen' },
  { href: '#gartenwelten', label: 'Gartenwelten' },
  { href: '#ueber-uns', label: 'Über uns' },
  { href: '#kontakt', label: 'Kontakt' },
]

export function Header() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  // Kontrastreicher Hintergrund, sobald der Header den Hero verlässt
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Aktiven Abschnitt markieren
  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1))
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Öffnungsanimation des mobilen Menüs: der Punkt wächst zur Fläche
  useLayoutEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    const ctx = gsap.context(() => {
      const reduce = prefersReducedMotion()
      const tl = gsap.timeline({ paused: true })
      tl.set(menu, { visibility: 'visible' })
      if (reduce) {
        tl.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.2 })
      } else {
        tl.fromTo(
          menu,
          { clipPath: 'circle(0% at calc(100% - 40px) 36px)' },
          { clipPath: 'circle(150% at calc(100% - 40px) 36px)', duration: 0.8, ease: EASE.scene },
        )
          .from('.mmenu__link', { yPercent: 110, duration: 0.8, ease: EASE.reveal, stagger: 0.06 }, 0.25)
          .from('.mmenu__foot', { opacity: 0, y: 16, duration: 0.6, ease: EASE.reveal }, 0.45)
      }
      tlRef.current = tl
    }, menu)
    return () => ctx.revert()
  }, [])

  const close = useCallback((returnFocus = true) => {
    setOpen(false)
    if (returnFocus) toggleRef.current?.focus()
  }, [])

  useEffect(() => {
    const tl = tlRef.current
    const root = document.documentElement
    if (open) {
      root.classList.add('menu-open')
      tl?.timeScale(1).play()
      const first = menuRef.current?.querySelector<HTMLElement>('a')
      first?.focus({ preventScroll: true })
    } else {
      root.classList.remove('menu-open')
      tl?.timeScale(1.6).reverse()
    }
  }, [open])

  // Fokusfalle & Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
      if (e.key !== 'Tab' || !menuRef.current || !toggleRef.current) return
      const items = [toggleRef.current, ...menuRef.current.querySelectorAll<HTMLElement>('a, button')]
      const idx = items.indexOf(document.activeElement as HTMLElement)
      const next = e.shiftKey ? (idx <= 0 ? items.length - 1 : idx - 1) : idx === items.length - 1 ? 0 : idx + 1
      e.preventDefault()
      items[next].focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  // Bei Wechsel auf Desktop Menü schliessen
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => mq.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <header className={`site-header${solid ? ' is-solid' : ''}${open ? ' is-open' : ''}`}>
      <div className="site-header__bar">
        <a className="site-header__brand" href="#top" aria-label="greendot – zum Seitenanfang">
          <Wordmark label={false} />
        </a>
        <nav className="site-nav" aria-label="Hauptnavigation">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} aria-current={active === n.href.slice(1) ? 'true' : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <LinkButton href="#kontakt" variant="primary" className="site-header__cta">
          Gartenprojekt besprechen
        </LinkButton>
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="visually-hidden">{open ? 'Menü schliessen' : 'Menü öffnen'}</span>
          <span className="menu-toggle__bars" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        className="mmenu"
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Mobile Navigation">
          <ul className="mmenu__list">
            {NAV.map((n, i) => (
              <li key={n.href} className="mmenu__item">
                <a className="mmenu__link" href={n.href} onClick={() => close(false)}>
                  <span className="mmenu__num">0{i + 1}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mmenu__foot">
          <LinkButton href="#kontakt" variant="primary" onClick={() => close(false)}>
            Gartenprojekt besprechen
          </LinkButton>
          <p className="mmenu__note">Gartenbau &amp; Gartenpflege</p>
        </div>
      </div>
    </header>
  )
}
