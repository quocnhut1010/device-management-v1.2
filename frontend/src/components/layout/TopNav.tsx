import { Moon, Sun, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'

export function TopNav() {
  const { profile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial = profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'
  const isRoleAdmin = profile?.role?.toLowerCase() === 'admin'

  return (
    <header className="topnav">
      <div className="topnav-title">
        Hệ thống Quản lý Thiết bị - Device Management
      </div>

      <div className="topnav-actions">
        {/* Theme Toggle */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Chuyển sang Giao diện tối' : 'Chuyển sang Giao diện sáng'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User Profile */}
        <div className="user-profile-badge">
          <div className="user-avatar">{initial}</div>
          <div className="user-info">
            <span className="user-name">{profile?.fullName || 'Người dùng'}</span>
            <span className="user-role">
              {isRoleAdmin ? 'Quản trị viên' : 'Nhân viên'}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button type="button" className="logout-btn" onClick={handleLogout} title="Đăng xuất">
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}
