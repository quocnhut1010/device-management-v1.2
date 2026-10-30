import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Users,
  AlertCircle,
  X,
  UserPlus,
  Building,
} from 'lucide-react'
import { getUsers, createUser, deleteUser, getDepartments } from '../services/resources'
import type { Department, User, UserStatus } from '../types'
import { Pagination } from '../components/Pagination'
import { useAuth } from '../contexts/AuthContext'

const userStatusConfig: Record<UserStatus, { text: string; className: string }> = {
  1: { text: 'Đang hoạt động', className: 'badge badge-green' },
  2: { text: 'Ngưng hoạt động', className: 'badge badge-red' },
}

export function UsersPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role?.toLowerCase() === 'admin'

  const [items, setItems] = useState<User[]>([])
  const [allItemsForStats, setAllItemsForStats] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Dialog states
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [createForm, setCreateForm] = useState({
    code: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    departmentId: '',
  })

  useEffect(() => {
    void loadStatsData()
    void loadDepartments()
  }, [])

  useEffect(() => {
    const id = setTimeout(() => {
      void loadData()
    }, 250)
    return () => clearTimeout(id)
  }, [page, keyword, status])

  async function loadDepartments() {
    try {
      const data = await getDepartments({ isActive: true })
      setDepartments(data)
    } catch {
      // quiet
    }
  }

  async function loadStatsData() {
    try {
      const data = await getUsers({ page: 1, pageSize: 100 })
      setAllItemsForStats(data.items)
    } catch {
      // quiet
    }
  }

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const data = await getUsers({ page, pageSize, keyword, status })
      setItems(data.items)
      setTotalItems(data.totalItems)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể tải danh sách người dùng.'
      setError(msg || 'Lỗi tải người dùng')
    } finally {
      setLoading(false)
    }
  }

  // 4 Statistics calculations
  const stats = useMemo(() => {
    const list = allItemsForStats.length > 0 ? allItemsForStats : items
    const total = list.length
    const active = list.filter(u => u.status === 1).length
    const adminCount = list.filter(u => u.code?.toUpperCase().includes('ADMIN') || u.email?.includes('admin')).length
    const employeeCount = total - adminCount
    return { total, active, adminCount, employeeCount }
  }, [allItemsForStats, items])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.code || !createForm.fullName || !createForm.email) return

    setSubmitting(true)
    setError('')
    try {
      await createUser({
        code: createForm.code.trim().toUpperCase(),
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        phoneNumber: createForm.phoneNumber.trim() || undefined,
        departmentId: createForm.departmentId || undefined,
      })
      setOpenCreateModal(false)
      setCreateForm({ code: '', fullName: '', email: '', phoneNumber: '', departmentId: '' })
      await Promise.all([loadData(), loadStatsData()])
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Thêm người dùng thất bại.'
      setError(msg || 'Lỗi thêm người dùng')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa/khóa tài khoản này không?')) return
    try {
      await deleteUser(id)
      await Promise.all([loadData(), loadStatsData()])
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Xóa tài khoản thất bại.'
      setError(msg || 'Lỗi xóa tài khoản')
    }
  }

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user)
    setOpenDetailModal(true)
  }

  return (
    <div>
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h1>Người dùng</h1>
          <p>Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpenCreateModal(true)}
          >
            <Plus size={16} />
            <span>Thêm người dùng</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Tổng số người dùng</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-sub">Tài khoản trong hệ thống</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đang hoạt động</div>
          <div className="stat-card-value" style={{ color: '#059669' }}>{stats.active}</div>
          <div className="stat-card-sub">Trạng thái Active</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Quản trị viên</div>
          <div className="stat-card-value" style={{ color: '#2563eb' }}>{stats.adminCount}</div>
          <div className="stat-card-sub">Quyền hệ thống Admin</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Nhân viên thông thường</div>
          <div className="stat-card-value" style={{ color: '#d97706' }}>{stats.employeeCount}</div>
          <div className="stat-card-sub">Người sử dụng thiết bị</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              className="input"
              placeholder="Tìm theo tên, mã nhân viên hoặc email..."
              value={keyword}
              onChange={e => {
                setPage(1)
                setKeyword(e.target.value)
              }}
            />
          </div>

          <select
            className="select"
            value={status}
            onChange={e => {
              setPage(1)
              setStatus(e.target.value)
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="2">Ngưng hoạt động</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            Đang tải dữ liệu người dùng...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Họ và tên</th>
                  <th>Phòng ban</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const badge = userStatusConfig[item.status] || {
                    text: `Trạng thái ${item.status}`,
                    className: 'badge badge-gray',
                  }
                  const initial = item.fullName ? item.fullName.charAt(0).toUpperCase() : 'U'

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.code}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                            {initial}
                          </div>
                          <span style={{ fontWeight: 500 }}>{item.fullName}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building size={14} style={{ color: '#64748b' }} />
                          <span>{item.departmentName || '—'}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--muted-foreground)' }}>{item.email}</td>
                      <td>{item.phoneNumber || '-'}</td>
                      <td>
                        <span className={badge.className}>{badge.text}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            title="Xem chi tiết"
                            onClick={() => handleOpenDetail(item)}
                          >
                            <Eye size={15} />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              className="btn-icon btn-icon-danger"
                              title="Xóa người dùng"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-foreground)' }}>
                      <Users size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                      <div>Không tìm thấy người dùng nào.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>

      {/* Modal Dialog: Thêm người dùng mới */}
      {openCreateModal && (
        <div className="modal-backdrop" onClick={() => setOpenCreateModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm người dùng mới</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setOpenCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Phòng ban</label>
                  <select
                    className="input"
                    value={createForm.departmentId}
                    onChange={e => setCreateForm({ ...createForm, departmentId: e.target.value })}
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mã nhân viên *</label>
                  <input
                    className="input"
                    placeholder="Ví dụ: NV003"
                    value={createForm.code}
                    onChange={e => setCreateForm({ ...createForm, code: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input
                    className="input"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={createForm.fullName}
                    onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Địa chỉ Email *</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="Ví dụ: an.nguyen@example.com"
                    value={createForm.email}
                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    className="input"
                    placeholder="Ví dụ: 0912345678"
                    value={createForm.phoneNumber}
                    onChange={e => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOpenCreateModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !createForm.code || !createForm.fullName || !createForm.email}
                >
                  <UserPlus size={16} />
                  <span>{submitting ? 'Đang lưu...' : 'Lưu người dùng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog: Xem chi tiết người dùng */}
      {openDetailModal && selectedUser && (
        <div className="modal-backdrop" onClick={() => setOpenDetailModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết người dùng</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setOpenDetailModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <span className="detail-label">Mã nhân viên:</span>
                <span className="detail-value" style={{ fontWeight: 700 }}>
                  {selectedUser.code}
                </span>

                <span className="detail-label">Họ và tên:</span>
                <span className="detail-value">{selectedUser.fullName}</span>

                <span className="detail-label">Phòng ban:</span>
                <span className="detail-value">{selectedUser.departmentName || '-'}</span>

                <span className="detail-label">Vai trò:</span>
                <span className="detail-value">{selectedUser.role || 'Employee'}</span>

                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>

                <span className="detail-label">Số điện thoại:</span>
                <span className="detail-value">{selectedUser.phoneNumber || '-'}</span>

                <span className="detail-label">Trạng thái:</span>
                <span className="detail-value">
                  <span className={userStatusConfig[selectedUser.status]?.className}>
                    {userStatusConfig[selectedUser.status]?.text}
                  </span>
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpenDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
