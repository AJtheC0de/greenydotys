import { Wordmark } from './Wordmark'
import { NAV } from './Header'

export function Footer() {
  return (
    <footer className="footer theme-dark">
      <div className="container">
        <div className="footer__top">
          <a href="#top" className="footer__brand" aria-label="greendot – zum Seitenanfang">
            <Wordmark label={false} className="wordmark--xl" />
          </a>
          <p className="footer__claim">Gartenbau und Gartenpflege – aus einem Punkt wird dein Garten.</p>
        </div>

        <div className="footer__cols">
          <nav aria-label="Fussnavigation">
            <h2 className="footer__h">Abschnitte</h2>
            <ul>
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
              <li>
                <a href="#pflege">Pflege</a>
              </li>
            </ul>
          </nav>
          <div>
            <h2 className="footer__h">Kontakt</h2>
            <address>
              <span className="ph">[Strasse und Hausnummer]</span>
              <span className="ph">[PLZ Ort]</span>
              <span className="ph">[Telefonnummer]</span>
              <span className="ph">[E-Mail-Adresse]</span>
            </address>
          </div>
          <div>
            <h2 className="footer__h">Rechtliches</h2>
            <ul>
              <li className="ph">[Impressum – folgt]</li>
              <li className="ph">[Datenschutzerklärung – folgt]</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} greendot</span>
          <span>Fotos: Unsplash · Illustrationen: greendot</span>
        </div>
      </div>
    </footer>
  )
}
