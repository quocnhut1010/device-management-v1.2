import { AlertCircle, X } from 'lucide-react'

interface ErrorModalProps {
  open: boolean
  title?: string
  message: string
  onClose: () => void
}

export function ErrorModal({
  open,
  title = 'Thông báo lỗi',
  message,
  onClose,
}: ErrorModalProps) {
  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
      }}
    >
      <div
        className="modal-container"
        style={{
          maxWidth: '460px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #fecaca',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="modal-header"
          style={{
            backgroundColor: '#fef2f2',
            padding: '16px 20px',
            borderBottom: '1px solid #fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertCircle size={20} color="#dc2626" />
            </div>
            <h3 style={{ margin: 0, color: '#991b1b', fontSize: '17px', fontWeight: 600 }}>
              {title}
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            style={{ color: '#991b1b' }}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            padding: '22px 24px',
            fontSize: '14.5px',
            lineHeight: 1.6,
            color: 'var(--foreground)',
          }}
        >
          {message}
        </div>

        <div
          className="modal-footer"
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--muted)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              fontWeight: 500,
              borderRadius: '6px',
              backgroundColor: '#dc2626',
              borderColor: '#dc2626',
            }}
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  )
}
