import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Loader2, Lock, Mail, ShieldAlert } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('1')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.'
      setErrorMessage(message || 'Đăng nhập không thành công.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillQuickAccount = (accEmail: string) => {
    setEmail(accEmail)
    setPassword('1')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon">
            <Building2 size={24} />
          </div>
          <h1>Đăng nhập</h1>
          <p>Nhập thông tin tài khoản để truy cập hệ thống Quản lý Thiết bị v1.2</p>
        </div>

        {errorMessage && (
          <div className="alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Địa chỉ Email
            </label>
            <div className="search-input-wrapper">
              <Mail size={16} className="search-icon" />
              <input
                id="email"
                type="email"
                className="input"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Mật khẩu
            </label>
            <div className="search-input-wrapper">
              <Lock size={16} className="search-icon" />
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px 16px', marginTop: '8px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Đang xác thực...</span>
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '12.5px', color: 'var(--muted-foreground)' }}>
          <div style={{ marginBottom: '8px', fontWeight: 600 }}>Tài khoản kiểm thử nhanh:</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillQuickAccount('admin@example.com')}
            >
              Admin (admin@example.com)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillQuickAccount('user@example.com')}
            >
              Nhân viên (user@example.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
