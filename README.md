# greendot – Website

Interaktive Startseite für greendot (Gartenbau & Gartenpflege).
Stack: React 19 · TypeScript · Vite · GSAP 3 + ScrollTrigger. Schriften lokal via Fontsource (Bricolage Grotesque, Inter – beide SIL OFL).

```bash
npm install
npm run dev      # Entwicklung
npm run build    # Produktions-Build nach dist/
```

## Aufbau
- `src/lib/motion.ts` – gemeinsame Bewegungssprache (Easings, Dauer, Breakpoints) und `useMotion` (gsap.matchMedia, räumt beim Unmount auf)
- `src/sections/` – Hero, Wachstum (gepinnte SVG-Szene), Leistungen (gepinnt auf Desktop), Gartenwelten (Vorher-Nachher-Slider, Bildmotive), Pflege (Jahreszeiten), Über uns, Kontakt
- `prefers-reduced-motion`: kein Pinning/Parallax, statische Kompositionen, kurze Überblendungen

## Offene Punkte (Platzhalter)
- **Formularversand**: Es gibt kein Backend. Das Formular validiert, sendet aber nichts und sagt das klar. Anbindung in `src/sections/Contact.tsx` → `onSubmit`.
- Kontaktdaten, Adresse, Impressum, Datenschutz, Team-/Standortangaben: mit `[…]` markiert.
- Vorher-Nachher ist eine **Gestaltungsvisualisierung** (Skizze aus dem Foto erzeugt), kein Kundenprojekt.
- Fotos: Unsplash (Unsplash-Lizenz). Vor dem Livegang durch eigene Projektfotos ersetzen, wenn vorhanden.
