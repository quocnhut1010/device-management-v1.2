import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { NotificationsPopover } from './NotificationsPopover'
import { ProfilePopover } from './ProfilePopover'

export function TopNav() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="topnav">
      <div className="topnav-title-wrapper">
        <h2 className="topnav-title">Device Management System</h2>
      </div>

      <div className="topnav-actions">
        {/* Notifications Popover */}
        <NotificationsPopover />

        {/* Theme Toggle Button (Ghost Icon Button) */}
        <button
          type="button"
          className="ghost-icon-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Chuyển sang Giao diện tối' : 'Chuyển sang Giao diện sáng'}
          aria-label="Đổi giao diện sáng/tối"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Profile Popover with Details, Stats & Logout */}
        <ProfilePopover />
      </div>
    </header>
  )
}
