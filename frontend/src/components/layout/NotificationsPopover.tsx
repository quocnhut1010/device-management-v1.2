import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck, Trash2, Clock, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  content: string
  createdAt: string
  isRead: boolean
  type: 'info' | 'success' | 'warning'
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Hệ thống sẵn sàng',
    content: 'Chào mừng bạn đến với Device Management System v1.2.',
    createdAt: new Date().toISOString(),
    isRead: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Bàn giao thiết bị',
    content: 'Kiểm tra danh sách bàn giao và xác nhận tình trạng thiết bị.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isRead: false,
    type: 'info',
  },
]

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const popoverRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

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

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-emerald-500" />
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500" />
      default:
        return <Info size={16} className="text-blue-500" />
    }
  }

  return (
    <div className="relative-container" ref={popoverRef}>
      <button
        type="button"
        className={`ghost-icon-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Thông báo"
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge-dot">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="popover-dropdown notifications-dropdown animate-fade-in" role="dialog">
          <div className="popover-header flex items-center justify-between">
            <div>
              <h3 className="popover-heading">Thông báo</h3>
              <p className="popover-subheading">
                Bạn có {unreadCount} thông báo chưa đọc
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-text-action text-xs"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck size={14} className="mr-1" />
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="popover-divider" />

          <div className="popover-scrollable max-h-[380px]">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <Bell size={36} className="empty-icon text-muted" />
                <p className="empty-text">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`notification-item ${!item.isRead ? 'unread' : ''}`}
                  >
                    <div className="notification-icon-wrap">{getIcon(item.type)}</div>
                    <div className="notification-body">
                      <div className="notification-top">
                        <span className="notification-title">{item.title}</span>
                        {!item.isRead && <span className="notification-unread-dot" />}
                      </div>
                      <p className="notification-desc">{item.content}</p>
                      <div className="notification-footer">
                        <span className="notification-time">
                          <Clock size={12} className="inline mr-1" />
                          Vừa xong
                        </span>
                        <div className="notification-actions">
                          {!item.isRead && (
                            <button
                              type="button"
                              className="btn-tiny"
                              onClick={() => handleMarkAsRead(item.id)}
                              title="Đánh dấu đã đọc"
                            >
                              Đã đọc
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-tiny btn-tiny-danger"
                            onClick={() => handleDelete(item.id)}
                            title="Xóa thông báo"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
