import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function Select({
  value,
  onChange,
  options,
  label,
  placeholder = '请选择',
  className,
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((o) => o.value === value)

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={clsx('flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
          className={clsx(
            'input-glow flex w-full items-center justify-between text-left',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon}
            {selectedOption ? (
              <span style={{ color: 'var(--text-primary)' }}>{selectedOption.label}</span>
            ) : (
              <span style={{ color: 'var(--text-tertiary)' }}>{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={clsx(
              'h-4 w-4 transition-transform duration-200',
              open && 'rotate-180',
            )}
            style={{ color: 'var(--text-tertiary)' }}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--glow-primary)',
              }}
            >
              <div className="max-h-60 overflow-y-auto py-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={clsx(
                      'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors duration-150',
                    )}
                    style={{
                      color: option.value === value ? 'var(--color-primary)' : 'var(--text-primary)',
                      background:
                        option.value === value
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))'
                          : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (option.value !== value) {
                        e.currentTarget.style.background = 'var(--bg-tertiary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (option.value !== value) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}