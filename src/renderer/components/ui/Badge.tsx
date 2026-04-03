import clsx from 'clsx'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'processing'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string }> = {
  default: {
    bg: 'var(--bg-tertiary)',
    text: 'var(--text-secondary)',
    dotColor: 'var(--text-tertiary)',
  },
  success: {
    bg: 'rgba(34, 197, 94, 0.12)',
    text: '#22C55E',
    dotColor: '#22C55E',
  },
  warning: {
    bg: 'rgba(234, 179, 8, 0.12)',
    text: '#EAB308',
    dotColor: '#EAB308',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.12)',
    text: '#EF4444',
    dotColor: '#EF4444',
  },
  info: {
    bg: 'rgba(99, 102, 241, 0.12)',
    text: '#818CF8',
    dotColor: '#818CF8',
  },
  processing: {
    bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12))',
    text: '#A78BFA',
    dotColor: '#A78BFA',
  },
}

export function Badge({ variant = 'default', children, className, dot = false }: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
      style={{
        background: styles.bg,
        color: styles.text,
      }}
    >
      {dot && (
        <span
          className={clsx('h-1.5 w-1.5 rounded-full', variant === 'processing' && 'animate-pulse')}
          style={{ background: styles.dotColor }}
        />
      )}
      {children}
    </span>
  )
}