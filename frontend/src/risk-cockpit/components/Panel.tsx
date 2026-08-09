import type { ReactNode } from 'react'
import * as theme from '../theme'

interface PanelProps {
  title: string
  children: ReactNode
  className?: string
}

export function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <section
      className={`flex flex-col gap-3 rounded-lg p-4 ${className}`}
      style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
    >
      <h2 className="text-xs font-semibold tracking-wider uppercase" style={{ color: theme.textMuted }}>
        {title}
      </h2>
      {children}
    </section>
  )
}
