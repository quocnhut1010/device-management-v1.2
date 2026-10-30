import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'

export interface ToastOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastItem extends ToastOptions {
  id: string
}

type Listener = (toasts: ToastItem[]) => void
let memoryToasts: ToastItem[] = []
let listeners: Listener[] = []

function notify() {
  listeners.forEach((l) => l([...memoryToasts]))
}

export function dismissToast(id: string) {
  memoryToasts = memoryToasts.filter((t) => t.id !== id)
  notify()
}

export function toast({
  title,
  description,
  variant = 'default',
  duration = 4500,
}: ToastOptions) {
  const id = Math.random().toString(36).slice(2, 9)
  const item: ToastItem = { id, title, description, variant, duration }
  memoryToasts = [...memoryToasts.slice(-2), item]
  notify()

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id)
    }, duration)
  }

  return { id, dismiss: () => dismissToast(id) }
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(memoryToasts)

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((l) => l !== setToasts)
    }
  }, [])

  return { toast, dismiss: dismissToast, toasts }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="toast-viewport">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`toast-item ${
            item.variant === 'destructive' ? 'toast-destructive' : 'toast-default'
          } animate-toast-in`}
          role="alert"
        >
          <div className="toast-icon">
            {item.variant === 'destructive' ? (
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            )}
          </div>
          <div className="toast-content">
            {item.title && <div className="toast-title">{item.title}</div>}
            {item.description && <div className="toast-desc">{item.description}</div>}
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => dismiss(item.id)}
            aria-label="Đóng thông báo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  )
}
