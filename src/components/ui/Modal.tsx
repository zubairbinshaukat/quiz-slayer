import { useEffect, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function Modal({ isOpen, onClose, title, children, className, contentClassName }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overscroll-contain" data-lenis-prevent>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full max-w-md bg-surface-card rounded-2xl shadow-modal',
          'border border-themed-border overflow-hidden animate-pop',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="px-6 pt-6 pb-4 border-b border-themed-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-content-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-secondary transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className={cn('p-6', contentClassName)}>{children}</div>
      </div>
    </div>
  )
}
