import { forwardRef, type ReactNode } from 'react'
import clsx from 'clsx'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  prefix?: ReactNode
  suffix?: ReactNode
  inputClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className, inputClassName, id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s+/g, '-').toLowerCase()

    return (
      <div className={clsx('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span
              className="pointer-events-none absolute left-3 flex items-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'input-glow w-full transition-all duration-200',
              prefix && 'pl-10',
              suffix && 'pr-10',
              error && '!border-red-500 focus:!border-red-500 focus:!shadow-none',
              inputClassName,
            )}
            {...props}
          />
          {suffix && (
            <span
              className="absolute right-3 flex items-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'