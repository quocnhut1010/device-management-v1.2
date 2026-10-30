import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Bell, Shield, Mail, Edit, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getDashboardStats } from '../../services/resources'
import { ProfileModal } from './ProfileModal'
import { ChangePasswordDialog } from './ChangePasswordDialog'
import type { UserDto } from '../../types'

export function ProfilePopover() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [stats, setStats] = useState({
    devices: 0,
    incidents: 0,
    repairs: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Load quick stats when popover opens or mounts
  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      try {
        setIsLoadingStats(true)
        const data = await getDashboardStats()
        if (isMounted && data) {
          setStats({
            devices: data.totalDevices || 0,
            incidents: data.pendingAssignments || 0,
            repairs: data.underRepairDevices || 0,
          })
        }
      } catch (err) {
        console.error('Error fetching dashboard stats for profile popover:', err)
      } finally {
        if (isMounted) {
          setIsLoadingStats(false)
        }
      }
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = () => {
    setIsOpen(false)
    logout()
    navigate('/login')
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  const isAdmin = profile?.role?.toLowerCase() === 'admin'
  const roleLabel = isAdmin ? 'Quản trị viên' : 'Nhân viên'
  const initials = getInitials(profile?.fullName)

  const displayUser: UserDto = {
    id: profile?.userId || '',
    fullName: profile?.fullName || 'Người dùng',
    email: profile?.email || '',
    role: isAdmin ? 'Quản trị viên' : 'Nhân viên',
    position: isAdmin ? 'Quản trị viên' : 'Nhân viên',
    departmentName: isAdmin ? 'Ban Quản Trị' : 'Phòng Kỹ Thuật',
    updatedAt: new Date().toISOString(),
  }

  return (
    <>
      <div className="relative-container" ref={popoverRef}>
        <button
          type="button"
          className={`profile-trigger-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Tài khoản cá nhân"
        >
          <div className="profile-trigger-avatar">
            {initials}
          </div>
          <div className="profile-trigger-info hidden md:block">
            <span className="profile-trigger-name">{profile?.fullName || 'Người dùng'}</span>
            <span className="profile-trigger-role">{roleLabel}</span>
          </div>
        </button>

        {isOpen && (
          <div className="popover-dropdown profile-dropdown animate-fade-in" role="dialog">
            {/* Header banner */}
            <div className="profile-popover-banner">
              <div className="profile-popover-banner-inner">
                <div className="profile-popover-large-avatar">
                  {initials}
                </div>
                <div className="profile-popover-info">
                  <h3 className="profile-popover-name" title={profile?.fullName}>
                    {profile?.fullName || 'Người dùng'}
                  </h3>
                  <span className={`profile-badge-shield ${isAdmin ? 'badge-admin' : 'badge-employee'}`}>
                    <Shield size={12} className="inline mr-1" />
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile details */}
            <div className="profile-popover-details">
              <div className="profile-detail-row">
                <Mail size={15} className="detail-icon" />
                <span className="detail-text" title={profile?.email}>
                  {profile?.email || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="profile-detail-row">
                <Shield size={15} className="detail-icon" />
                <span className="detail-text">
                  Phân quyền: {isAdmin ? 'Quản trị viên hệ thống' : 'Nhân viên nội bộ'}
                </span>
              </div>
            </div>

            <div className="popover-divider" />

            {/* Quick stats */}
            <div className="profile-quick-stats">
              <p className="quick-stats-title">Thống kê nhanh</p>
              <div className="quick-stats-grid">
                <div className="quick-stat-box">
                  <span className="stat-number">
                    {isLoadingStats ? '-' : stats.devices}
                  </span>
                  <span className="stat-label">Thiết bị</span>
                </div>
                <div className="quick-stat-box">
                  <span className="stat-number">
                    {isLoadingStats ? '-' : stats.incidents}
                  </span>
                  <span className="stat-label">Sự cố</span>
                </div>
                <div className="quick-stat-box">
                  <span className="stat-number">
                    {isLoadingStats ? '-' : stats.repairs}
                  </span>
                  <span className="stat-label">Sửa chữa</span>
                </div>
              </div>
            </div>

            <div className="popover-divider" />

            {/* Action buttons */}
            <div className="profile-popover-actions">
              <button
                type="button"
                className="profile-action-btn"
                onClick={() => {
                  setIsOpen(false)
                  setIsProfileModalOpen(true)
                }}
              >
                <Edit size={15} />
                <span>Chỉnh sửa hồ sơ</span>
              </button>

              <button
                type="button"
                className="profile-action-btn"
                onClick={() => {
                  setIsOpen(false)
                  setIsChangePasswordOpen(true)
                }}
              >
                <Lock size={15} />
                <span>Đổi mật khẩu</span>
              </button>

              <button
                type="button"
                className="profile-action-btn"
                onClick={() => {
                  setIsOpen(false)
                }}
              >
                <Bell size={15} />
                <span>Tùy chọn thông báo</span>
              </button>

              <div className="popover-divider my-1" />

              <button
                type="button"
                className="profile-action-btn text-danger"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={displayUser}
        onSuccess={() => {
          setIsProfileModalOpen(false)
        }}
      />

      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  )
}
