import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface DialogContextValue {
  open: boolean
  onClose: () => void
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined)

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  const onClose = React.useCallback(() => onOpenChange(false), [onOpenChange])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <DialogContext.Provider value={{ open, onClose }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogContent({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const context = React.useContext(DialogContext)
  if (!context) return null
  const { onClose } = context

  return createPortal(
    <div className="dialog-overlay animate-fade-in" onClick={onClose}>
      <div
        className={`dialog-content ${className} animate-zoom-in`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {children}
        <button
          type="button"
          className="dialog-close-btn"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body
  )
}

export function DialogHeader({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={`dialog-header ${className}`}>{children}</div>
}

export function DialogTitle({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <h2 className={`dialog-title ${className}`}>{children}</h2>
}

export function DialogDescription({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <p className={`dialog-description ${className}`}>{children}</p>
}

export function DialogFooter({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={`dialog-footer ${className}`}>{children}</div>
}
