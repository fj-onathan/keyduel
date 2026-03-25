import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const baseClass =
  'px-2.5 py-1.5 text-sm font-medium tracking-[0.02em] text-[#ab9b8d] transition-colors duration-200 hover:text-[#f7ebe0]'

const activeClass = 'text-[#fff5ea]'

export function NavChip({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink to={to} className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ''}`.trim()}>
      {children}
    </NavLink>
  )
}
