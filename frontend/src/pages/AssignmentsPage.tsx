import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Eye,
  RotateCcw,
  CheckCircle,
  XCircle,
  Ban,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  acceptAssignment,
  createAssignment,
  getAssignments,
  getDevices,
  getUsers,
  rejectAssignment,
  returnAssignment,
  revokeAssignment,
} from '../services/resources'
import type { Assignment, AssignmentStatus, Device, User } from '../types'
import { Pagination } from '../components/Pagination'

const assignmentStatusBadge: Record<AssignmentStatus, { text: string; className: string }> = {
  1: { text: 'Chờ xác nhận', className: 'badge badge-amber' },
  2: { text: 'Đang cấp phát', className: 'badge badge-blue' },
  3: { text: 'Đã từ chối', className: 'badge badge-red' },
  4: { text: 'Đã thu hồi', className: 'badge badge-gray' },
  5: { text: 'Đã thu hồi', className: 'badge badge-gray' },
}

export function AssignmentsPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role?.toLowerCase() === 'admin'
  const currentUserId = profile?.userId ?? ''

  const [items, setItems] = useState<Assignment[]>([])
  const [allItemsForStats, setAllItemsForStats] = useState<Assignment[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [status, setStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Dialog states
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [createForm, setCreateForm] = useState({
    deviceId: '',
    userId: '',
    note: '',
  })

  useEffect(() => {
    void loadSupportData()
  }, [])

  useEffect(() => {
    void loadAssignments()
  }, [page, status, profile?.role, currentUserId])

  async function loadSupportData() {
    try {
      const [deviceData, userData, allAssigns] = await Promise.all([
        getDevices({ page: 1, pageSize: 100 }),
        getUsers({ page: 1, pageSize: 100 }),
        getAssignments({ page: 1, pageSize: 100 }),
      ])
      setDevices(deviceData.items)
      setUsers(userData.items)
      setAllItemsForStats(allAssigns.items)

      if (deviceData.items.length > 0 && !createForm.deviceId) {
        setCreateForm(prev => ({
          ...prev,
          deviceId: deviceData.items[0].id,
          userId: userData.items.length > 0 ? userData.items[0].id : '',
        }))
      }
    } catch {
      // keep quiet
    }
  }

  async function loadAssignments() {
    setLoading(true)
    setError('')
    try {
      const data = await getAssignments({
        page,
        pageSize,
        status,
        userId: isAdmin ? undefined : currentUserId,
      })
      setItems(data.items)
      setTotalItems(data.totalItems)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể tải danh sách cấp phát.'
      setError(msg || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const deviceNameById = useMemo(
    () => Object.fromEntries(devices.map(x => [x.id, `${x.code} - ${x.name}`])),
    [devices]
  )
  const userNameById = useMemo(
    () => Object.fromEntries(users.map(x => [x.id, `${x.code} - ${x.fullName}`])),
    [users]
  )

  // 4 Statistics calculations
  const stats = useMemo(() => {
    const list = allItemsForStats.length > 0 ? allItemsForStats : items
    const total = list.length
    const active = list.filter(a => a.status === 2).length
    const returned = list.filter(a => a.status === 4 || a.status === 5).length
    const pending = list.filter(a => a.status === 1).length
    return { total, active, returned, pending }
  }, [allItemsForStats, items])

  // Filter items by client-side search keyword
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items
    const term = searchTerm.toLowerCase()
    return items.filter(item => {
      const devName = (deviceNameById[item.deviceId] || '').toLowerCase()
      const uName = (userNameById[item.userId] || '').toLowerCase()
      return devName.includes(term) || uName.includes(term)
    })
  }, [items, searchTerm, deviceNameById, userNameById])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.deviceId || !createForm.userId) return

    setSubmitting(true)
    setError('')
    try {
      await createAssignment({
        deviceId: createForm.deviceId,
        userId: createForm.userId,
        assignedByUserId: currentUserId,
        note: createForm.note,
      })
      setOpenCreateModal(false)
      setCreateForm({ deviceId: devices[0]?.id || '', userId: users[0]?.id || '', note: '' })
      await Promise.all([loadAssignments(), loadSupportData()])
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Tạo phiếu bàn giao thất bại.'
      setError(msg || 'Lỗi tạo cấp phát')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAction(action: 'accept' | 'reject' | 'return' | 'revoke', assignmentId: string) {
    setError('')
    try {
      if (action === 'accept') await acceptAssignment(assignmentId)
      if (action === 'reject') await rejectAssignment(assignmentId)
      if (action === 'return') await returnAssignment(assignmentId)
      if (action === 'revoke') await revokeAssignment(assignmentId)
      await Promise.all([loadAssignments(), loadSupportData()])
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Thao tác không thành công.'
      setError(msg || 'Lỗi thao tác')
    }
  }

  const handleOpenDetail = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setOpenDetailModal(true)
  }

  return (
    <div>
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h1>Cấp phát thiết bị</h1>
          <p>Theo dõi lịch sử cấp phát và thu hồi thiết bị</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpenCreateModal(true)}
          >
            <Plus size={16} />
            <span>Tạo cấp phát mới</span>
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
          <div className="stat-card-title">Tổng số lượt cấp phát</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-sub">Toàn bộ hồ sơ</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đang cấp phát</div>
          <div className="stat-card-value" style={{ color: '#2563eb' }}>{stats.active}</div>
          <div className="stat-card-sub">Thiết bị đang sử dụng</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đã thu hồi</div>
          <div className="stat-card-value" style={{ color: '#059669' }}>{stats.returned}</div>
          <div className="stat-card-sub">Đã hoàn tất vòng đời</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Chờ xác nhận</div>
          <div className="stat-card-value" style={{ color: '#d97706' }}>{stats.pending}</div>
          <div className="stat-card-sub">Đang chờ nhân viên nhận</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header-clean">
          <div className="card-title">Lịch sử cấp phát thiết bị</div>
          <div className="card-description">
            Hiển thị {filteredItems.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(page * pageSize, totalItems)} trong tổng số {totalItems} lượt cấp phát
          </div>
        </div>

        {/* Toolbar Filter */}
        <div className="toolbar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              className="input"
              placeholder="Tìm theo tên thiết bị hoặc người dùng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
            <option value="1">Chờ xác nhận (Pending)</option>
            <option value="2">Đang cấp phát (Accepted)</option>
            <option value="3">Đã từ chối (Rejected)</option>
            <option value="4">Đã thu hồi (Returned)</option>
            <option value="5">Đã thu hồi (Revoked)</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            Đang tải dữ liệu cấp phát...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thiết bị</th>
                  <th>Người được cấp phát</th>
                  <th>Ngày cấp phát</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const badge = assignmentStatusBadge[item.status] || {
                    text: `Trạng thái ${item.status}`,
                    className: 'badge badge-gray',
                  }
                  const isAssignedToMe = item.userId === currentUserId

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>
                        {deviceNameById[item.deviceId] || item.deviceId}
                      </td>
                      <td>{userNameById[item.userId] || item.userId}</td>
                      <td style={{ color: 'var(--muted-foreground)' }}>
                        {new Date(item.assignedAt).toLocaleString('vi-VN')}
                      </td>
                      <td>
                        <span className={badge.className}>{badge.text}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          {/* View Detail button */}
                          <button
                            type="button"
                            className="btn-icon"
                            title="Xem chi tiết"
                            onClick={() => handleOpenDetail(item)}
                          >
                            <Eye size={15} />
                          </button>

                          {/* Employee actions: Accept or Reject when Pending */}
                          {item.status === 1 && !isAdmin && isAssignedToMe && (
                            <>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleAction('accept', item.id)}
                              >
                                <CheckCircle size={14} />
                                <span>Tiếp nhận</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleAction('reject', item.id)}
                              >
                                <XCircle size={14} />
                                <span>Từ chối</span>
                              </button>
                            </>
                          )}

                          {/* Employee action: Return when InUse */}
                          {item.status === 2 && !isAdmin && isAssignedToMe && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleAction('return', item.id)}
                            >
                              <RotateCcw size={14} />
                              <span>Hoàn trả</span>
                            </button>
                          )}

                          {/* Admin action: Revoke when Pending or Accepted */}
                          {isAdmin && (item.status === 1 || item.status === 2) && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ color: '#dc2626' }}
                              onClick={() => handleAction('revoke', item.id)}
                            >
                              <Ban size={14} />
                              <span>Thu hồi</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-foreground)' }}>
                      Không có thiết bị nào trong danh sách.
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

      {/* Modal Dialog: Tạo cấp phát mới */}
      {openCreateModal && (
        <div className="modal-backdrop" onClick={() => setOpenCreateModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cấp phát thiết bị</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setOpenCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Chọn thiết bị *</label>
                  <select
                    className="select"
                    value={createForm.deviceId}
                    onChange={e => setCreateForm({ ...createForm, deviceId: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn thiết bị --</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name} ({d.status === 1 ? 'Sẵn sàng' : 'Khác'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Người tiếp nhận *</label>
                  <select
                    className="select"
                    value={createForm.userId}
                    onChange={e => setCreateForm({ ...createForm, userId: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.code} - {u.fullName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="textarea"
                    placeholder="Nhập ghi chú hoặc lý do cấp phát..."
                    value={createForm.note}
                    onChange={e => setCreateForm({ ...createForm, note: e.target.value })}
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
                  disabled={submitting || !createForm.deviceId || !createForm.userId}
                >
                  <UserCheck size={16} />
                  <span>{submitting ? 'Đang tạo...' : 'Xác nhận cấp phát'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog: Xem chi tiết cấp phát */}
      {openDetailModal && selectedAssignment && (
        <div className="modal-backdrop" onClick={() => setOpenDetailModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết cấp phát thiết bị</h3>
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
                <span className="detail-label">Mã phiếu:</span>
                <span className="detail-value" style={{ fontFamily: 'monospace' }}>
                  {selectedAssignment.id}
                </span>

                <span className="detail-label">Thiết bị:</span>
                <span className="detail-value">
                  {deviceNameById[selectedAssignment.deviceId] || selectedAssignment.deviceId}
                </span>

                <span className="detail-label">Người nhận:</span>
                <span className="detail-value">
                  {userNameById[selectedAssignment.userId] || selectedAssignment.userId}
                </span>

                <span className="detail-label">Thời gian cấp:</span>
                <span className="detail-value">
                  {new Date(selectedAssignment.assignedAt).toLocaleString('vi-VN')}
                </span>

                <span className="detail-label">Trạng thái:</span>
                <span className="detail-value">
                  <span className={assignmentStatusBadge[selectedAssignment.status]?.className}>
                    {assignmentStatusBadge[selectedAssignment.status]?.text}
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
