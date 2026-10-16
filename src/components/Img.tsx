import { imgProps } from '../lib/img'

type Props = {
  name: string
  alt: string
  sizes?: string
  className?: string
  priority?: boolean
}

/** Responsives Bild mit festen Proportionen (keine Layoutsprünge) und Lazy Loading. */
export function Img({ name, alt, sizes = '100vw', className, priority = false }: Props) {
  return (
    <img
      {...imgProps(name)}
      alt={alt}
      sizes={sizes}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  )
}
