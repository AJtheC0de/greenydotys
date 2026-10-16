type Props = { className?: string; label?: boolean }

/** Wortmarke: „greendot“ mit dem grünen Punkt als Markenzeichen. */
export function Wordmark({ className = '', label = true }: Props) {
  return (
    <span className={`wordmark ${className}`} aria-label={label ? 'greendot' : undefined} role={label ? 'img' : undefined}>
      <span className="wordmark__text" aria-hidden="true">greendot</span>
      <span className="wordmark__dot" aria-hidden="true" />
    </span>
  )
}
