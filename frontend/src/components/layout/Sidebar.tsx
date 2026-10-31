import { NavLink } from 'react-router-dom'
import {
  Building2,
  LayoutDashboard,
  Package,
  History,
  Layers,
  UserCheck,
  AlertCircle,
  Wrench,
  Users,
  Building,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function Sidebar() {
  const { profile } = useAuth()
  const role = profile?.role?.toLowerCase()
  const isAdmin = role === 'admin'
  const isTechnician = role === 'technician'
  const canAccessRepairs = isAdmin || isTechnician

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Building2 size={20} />
        </div>
        <div className="brand-text">
          <h1>
            Device Manager <span className="brand-badge">v1.2</span>
          </h1>
          <p>Quản lý thiết bị doanh nghiệp</p>
        </div>
      </div>

      <div className="sidebar-content">
        {/* Section 1: Bảng điều khiển */}
        <div>
          <div className="sidebar-section-title">Bảng điều khiển</div>
          <div className="sidebar-menu">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="sidebar-item-left">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Section 2: Quản lý thiết bị */}
        <div>
          <div className="sidebar-section-title">Quản lý thiết bị</div>
          <div className="sidebar-menu">
            <NavLink
              to="/devices"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="sidebar-item-left">
                <Package size={18} />
                <span>Danh sách thiết bị</span>
              </div>
            </NavLink>

            <NavLink
              to="/device-history"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="sidebar-item-left">
                <History size={18} />
                <span>Lịch sử thiết bị</span>
              </div>
            </NavLink>

            <NavLink
              to="/device-categories"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="sidebar-item-left">
                <Layers size={18} />
                <span>Loại & Model</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Section 3: Cấp phát thiết bị */}
        <div>
          <div className="sidebar-section-title">Quản lý cấp phát</div>
          <div className="sidebar-menu">
            <NavLink
              to="/assignments"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="sidebar-item-left">
                <UserCheck size={18} />
                <span>Bàn giao thiết bị</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Section 4: Bảo trì & Sự cố */}
        <div>
          <div className="sidebar-section-title">Bảo trì & Sự cố</div>
          <div className="sidebar-menu">
            <NavLink
              to="/incidents"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="sidebar-item-left">
                <AlertCircle size={18} />
                <span>Báo cáo sự cố</span>
              </div>
            </NavLink>

            {canAccessRepairs && (
              <NavLink
                to="/repairs"
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <div className="sidebar-item-left">
                  <Wrench size={18} />
                  <span>Lệnh sửa chữa</span>
                </div>
              </NavLink>
            )}
          </div>
        </div>

        {/* Section 5: Quản lý hệ thống (Admin only) */}
        {isAdmin && (
          <div>
            <div className="sidebar-section-title">Quản trị hệ thống</div>
            <div className="sidebar-menu">
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <div className="sidebar-item-left">
                  <Users size={18} />
                  <span>Quản lý người dùng</span>
                </div>
              </NavLink>

              <NavLink
                to="/departments"
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <div className="sidebar-item-left">
                  <Building size={18} />
                  <span>Phòng ban</span>
                </div>
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
