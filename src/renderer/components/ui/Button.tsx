import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  glow?: boolean
  loading?: boolean
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600',
  secondary:
    'bg-dark-700 text-dark-200 border border-dark-600 hover:bg-dark-600 hover:text-white',
  ghost: 'bg-transparent text-dark-300 hover:bg-dark-800 hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      glow = false,
      loading = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
          variantStyles[variant],
          sizeStyles[size],
          glow && variant === 'primary' && 'shadow-glow hover:shadow-glow-lg',
          isDisabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'