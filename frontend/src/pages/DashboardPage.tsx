import { useEffect, useMemo, useState } from 'react'
import {
  Package,
  CheckCircle2,
  Laptop,
  Clock,
  Users,
  UserCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDashboardStats, getDevices, getUsers, getAssignments } from '../services/resources'
import type { Device, User, Assignment, DashboardStats } from '../types'
import { useAuth } from '../contexts/AuthContext'

const assignmentStatusBadge: Record<number, { text: string; className: string }> = {
  1: { text: 'Chờ duyệt', className: 'badge badge-amber' },
  2: { text: 'Đã tiếp nhận', className: 'badge badge-green' },
  3: { text: 'Đã từ chối', className: 'badge badge-red' },
  4: { text: 'Đã hoàn trả', className: 'badge badge-purple' },
  5: { text: 'Đã thu hồi', className: 'badge badge-gray' },
}

export function DashboardPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role?.toLowerCase() === 'admin'

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true)
        const [statsRes, devicesRes, assignmentsRes] = await Promise.all([
          getDashboardStats(),
          getDevices({ page: 1, pageSize: 50 }),
          getAssignments({ page: 1, pageSize: 5 }),
        ])
        setStats(statsRes)
        setDevices(devicesRes.items)
        setRecentAssignments(assignmentsRes.items)

        if (isAdmin) {
          const usersRes = await getUsers({ page: 1, pageSize: 50 })
          setUsers(usersRes.items)
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [isAdmin])

  const deviceNameById = useMemo(
    () => Object.fromEntries(devices.map(d => [d.id, d.name])),
    [devices]
  )
  const userNameById = useMemo(
    () => Object.fromEntries(users.map(u => [u.id, u.fullName])),
    [users]
  )

  return (
    <div>
      <div className="page-header">
        <h2>Bảng điều khiển tổng quan</h2>
        <p>
          Chào mừng trở lại, <strong>{profile?.fullName}</strong>! Dưới đây là thống kê tình trạng hệ thống hôm nay.
        </p>
      </div>

      {/* Thống kê dạng thẻ (Stats Cards) phản ánh toàn bộ dữ liệu từ Database */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <Package size={24} />
          </div>
          <div className="stat-details">
            <h4>Tổng số thiết bị</h4>
            <div className="stat-number">{isLoading ? '...' : (stats?.totalDevices ?? 0)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-details">
            <h4>Sẵn sàng cấp phát</h4>
            <div className="stat-number">{isLoading ? '...' : (stats?.availableDevices ?? 0)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <Laptop size={24} />
          </div>
          <div className="stat-details">
            <h4>Đang được sử dụng</h4>
            <div className="stat-number">{isLoading ? '...' : (stats?.inUseDevices ?? 0)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <h4>Chờ duyệt bàn giao</h4>
            <div className="stat-number">{isLoading ? '...' : (stats?.pendingDevices ?? 0)}</div>
          </div>
        </div>

        {isAdmin ? (
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-blue">
              <Users size={24} />
            </div>
            <div className="stat-details">
              <h4>Tổng người dùng</h4>
              <div className="stat-number">{isLoading ? '...' : (stats?.totalUsers ?? 0)}</div>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-blue">
              <UserCheck size={24} />
            </div>
            <div className="stat-details">
              <h4>Phiếu của tôi</h4>
              <div className="stat-number">{isLoading ? '...' : (stats?.myAssignments ?? 0)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Grid 2 cột: Thao tác nhanh & Bàn giao gần đây */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Quick Actions */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#2563eb" />
            <span>Thao tác nhanh</span>
          </div>
          <div className="card-description">
            Truy cập nhanh các phân hệ nghiệp vụ chính của hệ thống.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to="/devices"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--secondary)',
                border: '1px solid var(--border)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} color="#2563eb" />
                <span style={{ fontWeight: 500 }}>Tra cứu & Quản lý thiết bị</span>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/assignments"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--secondary)',
                border: '1px solid var(--border)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={18} color="#10b981" />
                <span style={{ fontWeight: 500 }}>
                  {isAdmin ? 'Tạo bàn giao & Xem lịch sử cấp phát' : 'Xem thiết bị được cấp phát'}
                </span>
              </div>
              <ArrowRight size={16} />
            </Link>

            {isAdmin && (
              <Link
                to="/users"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={18} color="#8b5cf6" />
                  <span style={{ fontWeight: 500 }}>Quản lý danh sách người dùng</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>

        {/* Recent Assignments Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color="#10b981" />
              <span>Hoạt động bàn giao gần nhất</span>
            </div>
            <Link to="/assignments" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>
              Xem tất cả
            </Link>
          </div>
          <div className="card-description">Các lượt bàn giao hoặc hoàn trả gần đây.</div>

          {recentAssignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--muted-foreground)', fontSize: '14px' }}>
              Chưa có dữ liệu bàn giao.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Thiết bị</th>
                    <th>Người nhận</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssignments.map(item => {
                    const badge = assignmentStatusBadge[item.status] || {
                      text: `Trạng thái ${item.status}`,
                      className: 'badge badge-gray',
                    }
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>
                          {deviceNameById[item.deviceId] || item.deviceId}
                        </td>
                        <td>{userNameById[item.userId] || (item.userId === profile?.userId ? 'Tôi' : item.userId)}</td>
                        <td>
                          <span className={badge.className}>{badge.text}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
