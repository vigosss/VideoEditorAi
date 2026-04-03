import { type ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  showClose?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  showClose = true,
}: ModalProps) {
  // ESC 关闭
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={onClose}
          />

          {/* 模态框内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={clsx('glass-card relative z-10 w-full max-w-md p-6', className)}
          >
            {/* 标题栏 */}
            {(title || showClose) && (
              <div className="mb-4 flex items-center justify-between">
                {title && (
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {title}
                  </h3>
                )}
                {showClose && (
                  <Button variant="ghost" onClick={onClose} className="h-7 w-7 !p-0 rounded-lg">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* 内容 */}
            <div style={{ color: 'var(--text-secondary)' }}>{children}</div>

            {/* 底部操作 */}
            {footer && <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}