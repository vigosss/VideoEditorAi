import clsx from 'clsx'

interface ProgressProps {
  value: number // 0-100
  label?: string
  showPercent?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function Progress({
  value,
  label,
  showPercent = false,
  size = 'md',
  className,
}: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={clsx('w-full overflow-hidden rounded-full', sizeStyles[size])}
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', size === 'lg' && 'animate-gradient-flow bg-[length:200%_100%]')}
          style={{
            width: `${clampedValue}%`,
            background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #06B6D4, #8B5CF6, #6366F1)',
            boxShadow: clampedValue > 0 ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none',
          }}
        />
      </div>
    </div>
  )
}