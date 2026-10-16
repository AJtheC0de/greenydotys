import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'forest'

type Common = { variant?: Variant; children: ReactNode; className?: string }

function cls(variant: Variant, className?: string) {
  return `btn btn--${variant}${className ? ` ${className}` : ''}`
}

function Inner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="btn__dot" aria-hidden="true" />
      <span className="btn__label">{children}</span>
    </>
  )
}

export function LinkButton({ variant = 'primary', children, className, ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cls(variant, className)} {...rest}>
      <Inner>{children}</Inner>
    </a>
  )
}

export function Button({ variant = 'primary', children, className, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cls(variant, className)} {...rest}>
      <Inner>{children}</Inner>
    </button>
  )
}
