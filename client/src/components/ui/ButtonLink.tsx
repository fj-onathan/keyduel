import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'

type Variant = 'primary' | 'secondary'

const baseClass =
  'inline-flex items-center justify-center rounded-full px-6 py-2.5 text-base font-semibold tracking-tight transition-all duration-200'

const variantClass: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-accent to-accent-strong text-[#2b1300] hover:-translate-y-0.5',
  secondary: 'border border-white/20 bg-[#16110d]/75 text-[#f2e7da] hover:-translate-y-0.5 hover:border-white/30',
}

export function ButtonLink({to, variant = 'secondary', children}: {
  to: string;
  variant?: Variant;
  children: ReactNode
}) {
  return (
    <Link to={to} className={`${baseClass} ${variantClass[variant]}`}>
      {children}
    </Link>
  )
}
