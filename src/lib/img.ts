const RATIO: Record<string, number> = {
  hero: 1.5, bau: 1.5, pflege: 16 / 9, pflanz: 1.5, hecke: 1.5, garden: 16 / 9,
  'garden-sketch': 16 / 9, gruen: 1.5, ankommen: 2 / 3, zusammen: 4 / 3, bleiben: 4 / 3, haende: 2 / 3, erde: 1.5,
}
const WIDTHS: Record<string, number[]> = {
  hero: [1200, 2400], bau: [800, 1400], pflege: [800, 1400], pflanz: [800, 1400], hecke: [800, 1400],
  garden: [1000, 2000], gruen: [1000, 2000], 'garden-sketch': [1000, 2000], ankommen: [600, 1000], zusammen: [800, 1400],
  bleiben: [700, 1200], haende: [700, 1200], erde: [800, 1400],
}
const base = import.meta.env.BASE_URL

export function imgProps(name: string) {
  const ws = WIDTHS[name]
  const max = ws[ws.length - 1]
  return {
    src: `${base}img/${name}-${max}.webp`,
    srcSet: ws.map((w) => `${base}img/${name}-${w}.webp ${w}w`).join(', '),
    width: max,
    height: Math.round(max / RATIO[name]),
  }
}
