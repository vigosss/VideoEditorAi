import { type ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  title?: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
}

export function Card({
  title,
  description,
  children,
  actions,
  className,
  hoverable = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={clsx(
        'glass-card p-5',
        hoverable && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between">
          <div>
            {title && (
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}