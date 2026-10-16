import type { ElementType } from 'react'

type Props = {
  lines: string[]
  as?: ElementType
  className?: string
  id?: string
  /** Generischer Scroll-Reveal (data-lines). Für Szenen mit eigener Choreografie auf false setzen. */
  reveal?: boolean
}

/** Headline, deren Zeilen über eine Maske eingeblendet werden. */
export function Lines({ lines, as: Tag = 'h2', className, id, reveal = true }: Props) {
  return (
    <Tag className={className} id={id} data-lines={reveal ? '' : undefined}>
      {lines.map((line, i) => (
        <span className="ln" key={i}>
          <span className="ln-i">{line}</span>
          {i < lines.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}
