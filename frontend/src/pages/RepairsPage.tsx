import { useEffect, useState, useMemo } from 'react'
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Plus,
  Search,
  UserCheck,
  Wrench,
  X,
  Settings,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  assignRepairOrder,
  createRepairOrder,
  getDevices,
  getRepairOrders,
  getUsers,
  updateRepairOrderStatus,
} from '../services/resources'
import type {
  Device,
  RepairOrder,
  RepairPriority,
  RepairStatus,
  User,
} from '../types'
import { Pagination } from '../components/Pagination'

const priorityBadge: Record<RepairPriority, { text: string; className: string }> = {
  1: { text: 'Thấp', className: 'badge badge-gray' },
  2: { text: 'Trung bình', className: 'badge badge-blue' },
  3: { text: 'Cao', className: 'badge badge-amber' },
  4: { text: 'Khẩn cấp', className: 'badge badge-red' },
}

const statusBadge: Record<RepairStatus, { text: string; className: string }> = {
  1: { text: 'Chờ xử lý', className: 'badge badge-amber' },
  2: { text: 'Đã phân công', className: 'badge badge-blue' },
  3: { text: 'Đang sửa chữa', className: 'badge badge-purple' },
  4: { text: 'Chờ linh kiện', className: 'badge badge-amber' },
  5: { text: 'Hoàn thành', className: 'badge badge-green' },
  6: { text: 'Đã đóng', className: 'badge badge-gray' },
  7: { text: 'Đã hủy', className: 'badge badge-red' },
}

function formatCurrency(val?: number | null) {
  if (val === undefined || val === null) return '-'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}

export function RepairsPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role?.toLowerCase() === 'admin'
  const isTechnician = profile?.role?.toLowerCase() === 'technician'

  const [items, setItems] = useState<RepairOrder[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Modals
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [openAssignModal, setOpenAssignModal] = useState(false)
  const [openStatusModal, setOpenStatusModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Forms
  const [createForm, setCreateForm] = useState({
    code: '',
    deviceId: '',
    assignedToUserId: '',
    priority: 2 as RepairPriority,
    estimatedCost: '',
    description: '',
  })

  const [assignUserId, setAssignUserId] = useState('')

  const [statusForm, setStatusForm] = useState({
    status: 3 as RepairStatus,
    actualCost: '',
    resolutionNotes: '',
  })

  useEffect(() => {
    void loadInitialData()
  }, [])

  useEffect(() => {
    void loadRepairOrders()
  }, [page, pageSize, statusFilter, priorityFilter, searchTerm])

  async function loadInitialData() {
    try {
      const [deviceData, userData] = await Promise.all([
        getDevices({ page: 1, pageSize: 100 }),
        getUsers({ page: 1, pageSize: 100 }),
      ])
      setDevices(deviceData.items)
      setUsers(userData.items)
      if (deviceData.items.length > 0) {
        setCreateForm(prev => ({ ...prev, deviceId: deviceData.items[0].id }))
      }
    } catch {
      // keep quiet
    }
  }

  async function loadRepairOrders() {
    setLoading(true)
    setError('')
    try {
      const data = await getRepairOrders({
        keyword: searchTerm.trim() || undefined,
        status: statusFilter ? Number(statusFilter) : undefined,
        priority: priorityFilter ? Number(priorityFilter) : undefined,
        page,
        pageSize,
      })
      setItems(data.items)
      setTotalItems(data.totalItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách lệnh sửa chữa')
    } finally {
      setLoading(false)
    }
  }

  // Summary counts
  const stats = useMemo(() => {
    const total = totalItems
    const inProgress = items.filter(o => o.status === 2 || o.status === 3 || o.status === 4).length
    const completed = items.filter(o => o.status === 5).length
    const closed = items.filter(o => o.status === 6).length
    return { total, inProgress, completed, closed }
  }, [items, totalItems])

  const technicians = useMemo(() => {
    return users.filter(u => u.role?.toLowerCase() === 'technician')
  }, [users])

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.deviceId) {
      setError('Vui lòng chọn thiết bị.')
      return
    }
    if (!createForm.description.trim()) {
      setError('Vui lòng nhập mô tả sự cố / yêu cầu sửa chữa.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await createRepairOrder({
        code: createForm.code.trim() || undefined,
        deviceId: createForm.deviceId,
        assignedToUserId: createForm.assignedToUserId || undefined,
        priority: createForm.priority,
        estimatedCost: createForm.estimatedCost ? parseFloat(createForm.estimatedCost) : undefined,
        description: createForm.description.trim(),
      })
      setOpenCreateModal(false)
      setCreateForm({
        code: '',
        deviceId: devices[0]?.id || '',
        assignedToUserId: '',
        priority: 2,
        estimatedCost: '',
        description: '',
      })
      setSuccessMsg('Đã tạo Lệnh sửa chữa thành công!')
      setTimeout(() => setSuccessMsg(''), 4000)
      await loadRepairOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo lệnh sửa chữa')
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenAssignModal(order: RepairOrder) {
    setSelectedOrder(order)
    setAssignUserId(order.assignedToUserId || (technicians[0]?.id || ''))
    setOpenAssignModal(true)
  }

  async function handleAssignTechnician(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedOrder || !assignUserId) {
      setError('Vui lòng chọn kỹ thuật viên.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await assignRepairOrder(selectedOrder.id, {
        assignedToUserId: assignUserId,
      })
      setOpenAssignModal(false)
      setSuccessMsg('Đã phân công kỹ thuật viên thành công!')
      setTimeout(() => setSuccessMsg(''), 4000)
      await loadRepairOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể phân công kỹ thuật viên')
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenStatusModal(order: RepairOrder) {
    setSelectedOrder(order)
    // Default next reasonable status
    let nextStatus: RepairStatus = order.status
    if (order.status === 2) nextStatus = 3 // Assigned -> InProgress
    else if (order.status === 3) nextStatus = 5 // InProgress -> Completed
    else if (order.status === 5 && isAdmin) nextStatus = 6 // Completed -> Closed

    setStatusForm({
      status: nextStatus,
      actualCost: order.actualCost ? order.actualCost.toString() : (order.estimatedCost ? order.estimatedCost.toString() : ''),
      resolutionNotes: order.resolutionNotes || '',
    })
    setOpenStatusModal(true)
  }

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedOrder) return

    setSubmitting(true)
    setError('')
    try {
      await updateRepairOrderStatus(selectedOrder.id, {
        status: statusForm.status,
        actualCost: statusForm.actualCost ? parseFloat(statusForm.actualCost) : null,
        resolutionNotes: statusForm.resolutionNotes.trim() || null,
      })
      setOpenStatusModal(false)
      setSuccessMsg('Cập nhật tiến độ sửa chữa thành công!')
      setTimeout(() => setSuccessMsg(''), 4000)
      await loadRepairOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1>Quản lý Sửa chữa & Bảo trì</h1>
          <p>Điều phối lệnh sửa chữa thiết bị, quản lý kỹ thuật viên và kiểm soát chi phí</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setError('')
              setCreateForm(prev => ({
                ...prev,
                code: `SC-${Date.now().toString().slice(-6)}`,
              }))
              setOpenCreateModal(true)
            }}
          >
            <Plus size={16} />
            <span>Tạo lệnh sửa chữa</span>
          </button>
        )}
      </div>

      {/* Success alert */}
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Tổng số lệnh SC</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-sub">Toàn bộ hồ sơ sửa chữa</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đang xử lý</div>
          <div className="stat-card-value" style={{ color: '#2563eb' }}>{stats.inProgress}</div>
          <div className="stat-card-sub">Đang sửa hoặc chờ linh kiện</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đã hoàn thành</div>
          <div className="stat-card-value" style={{ color: '#059669' }}>{stats.completed}</div>
          <div className="stat-card-sub">Chờ nghiệm thu & đóng</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đã nghiệm thu / Đóng</div>
          <div className="stat-card-value" style={{ color: '#64748b' }}>{stats.closed}</div>
          <div className="stat-card-sub">Hoàn tất vòng đời sửa chữa</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header-clean">
          <div className="card-title">Danh sách Lệnh sửa chữa</div>
          <div className="card-description">
            Hiển thị {items.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(page * pageSize, totalItems)} trong tổng số {totalItems} lệnh
          </div>
        </div>

        {/* Filters */}
        <div className="toolbar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              className="input"
              placeholder="Tìm theo mã lệnh, thiết bị, KTV..."
              value={searchTerm}
              onChange={e => {
                setPage(1)
                setSearchTerm(e.target.value)
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="select"
              value={statusFilter}
              onChange={e => {
                setPage(1)
                setStatusFilter(e.target.value)
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Chờ xử lý (Pending)</option>
              <option value="2">Đã phân công (Assigned)</option>
              <option value="3">Đang sửa chữa (InProgress)</option>
              <option value="4">Chờ linh kiện (PendingParts)</option>
              <option value="5">Hoàn thành (Completed)</option>
              <option value="6">Đã đóng (Closed)</option>
              <option value="7">Đã hủy (Cancelled)</option>
            </select>

            <select
              className="select"
              value={priorityFilter}
              onChange={e => {
                setPage(1)
                setPriorityFilter(e.target.value)
              }}
            >
              <option value="">Tất cả mức ưu tiên</option>
              <option value="1">Thấp</option>
              <option value="2">Trung bình</option>
              <option value="3">Cao</option>
              <option value="4">Khẩn cấp</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            Đang tải dữ liệu sửa chữa...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã lệnh</th>
                  <th>Thiết bị</th>
                  <th>Sự cố liên quan</th>
                  <th>Kỹ thuật viên</th>
                  <th>Mức ưu tiên</th>
                  <th>Chi phí</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                      Không tìm thấy lệnh sửa chữa nào
                    </td>
                  </tr>
                ) : (
                  items.map(order => (
                    <tr key={order.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          {order.code}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.deviceCode || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          {order.deviceName}
                        </div>
                      </td>
                      <td>
                        {order.incidentTitle ? (
                          <div
                            style={{
                              fontSize: '13px',
                              maxWidth: '180px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={order.incidentTitle}
                          >
                            {order.incidentTitle}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                            Trực tiếp (Không qua sự cố)
                          </span>
                        )}
                      </td>
                      <td>
                        {order.assignedToUserName ? (
                          <div style={{ fontWeight: 500 }}>{order.assignedToUserName}</div>
                        ) : (
                          <span className="badge badge-amber">Chưa phân công</span>
                        )}
                      </td>
                      <td>
                        <span className={priorityBadge[order.priority]?.className || 'badge'}>
                          {priorityBadge[order.priority]?.text || order.priority}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>
                          <strong>{formatCurrency(order.actualCost ?? order.estimatedCost)}</strong>
                        </div>
                        {order.actualCost && order.estimatedCost && order.actualCost !== order.estimatedCost && (
                          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                            Dự toán: {formatCurrency(order.estimatedCost)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={statusBadge[order.status]?.className || 'badge'}>
                          {statusBadge[order.status]?.text || order.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {/* Chi tiết */}
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Chi tiết lệnh"
                            onClick={() => {
                              setSelectedOrder(order)
                              setOpenDetailModal(true)
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Phân công KTV (Admin only, khi lệnh chưa hoàn tất/đóng/hủy) */}
                          {isAdmin && order.status !== 5 && order.status !== 6 && order.status !== 7 && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              title="Phân công Kỹ thuật viên"
                              onClick={() => handleOpenAssignModal(order)}
                            >
                              <UserCheck size={14} />
                            </button>
                          )}

                          {/* Cập nhật tiến độ / Hoàn tất (Admin hoặc KTV được chỉ định) */}
                          {(isAdmin || isTechnician) && order.status !== 6 && order.status !== 7 && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              title="Cập nhật tiến độ"
                              onClick={() => handleOpenStatusModal(order)}
                            >
                              <Settings size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
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

      {/* Modal 1: Tạo Lệnh sửa chữa mới (Admin) */}
      {openCreateModal && (
        <div className="modal-backdrop" onClick={() => setOpenCreateModal(false)}>
          <div className="modal-container" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo Lệnh sửa chữa mới</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setOpenCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Mã lệnh sửa chữa</label>
                  <input
                    className="input"
                    placeholder="Mã tự sinh nếu để trống"
                    value={createForm.code}
                    onChange={e => setCreateForm({ ...createForm, code: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Chọn thiết bị cần sửa chữa *</label>
                  <select
                    className="select"
                    value={createForm.deviceId}
                    onChange={e => setCreateForm({ ...createForm, deviceId: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn thiết bị --</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name} ({d.serialNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Chỉ định kỹ thuật viên</label>
                  <select
                    className="select"
                    value={createForm.assignedToUserId}
                    onChange={e => setCreateForm({ ...createForm, assignedToUserId: e.target.value })}
                  >
                    <option value="">-- Chưa chỉ định (Để trống) --</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Mức độ ưu tiên</label>
                  <select
                    className="select"
                    value={createForm.priority}
                    onChange={e =>
                      setCreateForm({ ...createForm, priority: Number(e.target.value) as RepairPriority })
                    }
                  >
                    <option value="1">Thấp</option>
                    <option value="2">Trung bình</option>
                    <option value="3">Cao</option>
                    <option value="4">Khẩn cấp</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Dự toán chi phí (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="input"
                    placeholder="VD: 500000"
                    value={createForm.estimatedCost}
                    onChange={e => setCreateForm({ ...createForm, estimatedCost: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Mô tả tình trạng & Yêu cầu sửa chữa *</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Mô tả cụ thể hư hỏng, linh kiện cần thay thế..."
                    value={createForm.description}
                    onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setOpenCreateModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang tạo...' : 'Tạo Lệnh sửa chữa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Phân công kỹ thuật viên (Admin) */}
      {openAssignModal && selectedOrder && (
        <div className="modal-backdrop" onClick={() => setOpenAssignModal(false)}>
          <div className="modal-container" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Phân công Kỹ thuật viên</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setOpenAssignModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAssignTechnician}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px', fontSize: '14px' }}>
                  <strong>Mã lệnh:</strong> {selectedOrder.code}
                  <br />
                  <strong>Thiết bị:</strong> {selectedOrder.deviceCode} - {selectedOrder.deviceName}
                </div>

                <div className="form-group">
                  <label className="label">Chọn Kỹ thuật viên phụ trách *</label>
                  <select
                    className="select"
                    value={assignUserId}
                    onChange={e => setAssignUserId(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn kỹ thuật viên --</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setOpenAssignModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : 'Xác nhận phân công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Cập nhật tiến độ / trạng thái (Admin hoặc KTV) */}
      {openStatusModal && selectedOrder && (
        <div className="modal-backdrop" onClick={() => setOpenStatusModal(false)}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cập nhật tiến độ sửa chữa</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setOpenStatusModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px', fontSize: '14px' }}>
                  <strong>Lệnh sửa chữa:</strong> {selectedOrder.code}
                  <br />
                  <strong>Thiết bị:</strong> {selectedOrder.deviceCode} - {selectedOrder.deviceName}
                </div>

                <div className="form-group">
                  <label className="label">Trạng thái mới *</label>
                  <select
                    className="select"
                    value={statusForm.status}
                    onChange={e =>
                      setStatusForm({ ...statusForm, status: Number(e.target.value) as RepairStatus })
                    }
                  >
                    <option value="2">Đã phân công (Assigned)</option>
                    <option value="3">Đang thực hiện sửa chữa (In Progress)</option>
                    <option value="4">Chờ linh kiện thay thế (Pending Parts)</option>
                    <option value="5">Đã sửa chữa hoàn thành (Completed)</option>
                    {isAdmin && <option value="6">Đã nghiệm thu & đóng lệnh (Closed)</option>}
                    {isAdmin && <option value="7">Hủy lệnh sửa chữa (Cancelled)</option>}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Chi phí thực tế (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="input"
                    placeholder="Nhập chi phí thực tế phát sinh..."
                    value={statusForm.actualCost}
                    onChange={e => setStatusForm({ ...statusForm, actualCost: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Ghi chú giải quyết / Biên bản xử lý</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Linh kiện đã thay, kết quả kiểm thử sau sửa, khuyến nghị bảo dưỡng..."
                    value={statusForm.resolutionNotes}
                    onChange={e => setStatusForm({ ...statusForm, resolutionNotes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setOpenStatusModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Chi tiết Lệnh sửa chữa */}
      {openDetailModal && selectedOrder && (
        <div className="modal-backdrop" onClick={() => setOpenDetailModal(false)}>
          <div className="modal-container" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết Lệnh sửa chữa</h3>
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
                <span className="detail-label">Mã lệnh SC:</span>
                <span className="detail-value" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  {selectedOrder.code}
                </span>

                <span className="detail-label">Thiết bị:</span>
                <span className="detail-value" style={{ fontWeight: 600 }}>
                  {selectedOrder.deviceCode} - {selectedOrder.deviceName}
                </span>

                <span className="detail-label">Sự cố liên quan:</span>
                <span className="detail-value">
                  {selectedOrder.incidentTitle || 'Trực tiếp (Không qua sự cố)'}
                </span>

                <span className="detail-label">Kỹ thuật viên:</span>
                <span className="detail-value">
                  {selectedOrder.assignedToUserName || 'Chưa phân công'}
                </span>

                <span className="detail-label">Mức ưu tiên:</span>
                <span className="detail-value">
                  <span className={priorityBadge[selectedOrder.priority]?.className || 'badge'}>
                    {priorityBadge[selectedOrder.priority]?.text}
                  </span>
                </span>

                <span className="detail-label">Trạng thái:</span>
                <span className="detail-value">
                  <span className={statusBadge[selectedOrder.status]?.className || 'badge'}>
                    {statusBadge[selectedOrder.status]?.text}
                  </span>
                </span>

                <span className="detail-label">Chi phí dự toán:</span>
                <span className="detail-value">{formatCurrency(selectedOrder.estimatedCost)}</span>

                <span className="detail-label">Chi phí thực tế:</span>
                <span className="detail-value" style={{ fontWeight: 600, color: '#059669' }}>
                  {formatCurrency(selectedOrder.actualCost)}
                </span>

                <span className="detail-label">Ngày bắt đầu:</span>
                <span className="detail-value">
                  {selectedOrder.startDate
                    ? new Date(selectedOrder.startDate).toLocaleString('vi-VN')
                    : 'Chưa bắt đầu'}
                </span>

                {selectedOrder.completedDate && (
                  <>
                    <span className="detail-label">Ngày hoàn thành:</span>
                    <span className="detail-value">
                      {new Date(selectedOrder.completedDate).toLocaleString('vi-VN')}
                    </span>
                  </>
                )}

                <span className="detail-label">Mô tả sửa chữa:</span>
                <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedOrder.description}
                </span>

                {selectedOrder.resolutionNotes && (
                  <>
                    <span className="detail-label">Biên bản xử lý:</span>
                    <span className="detail-value" style={{ whiteSpace: 'pre-wrap', color: '#059669' }}>
                      {selectedOrder.resolutionNotes}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setOpenDetailModal(false)}
              >
                Đóng
              </button>
              {(isAdmin || isTechnician) && selectedOrder.status !== 6 && selectedOrder.status !== 7 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setOpenDetailModal(false)
                    handleOpenStatusModal(selectedOrder)
                  }}
                >
                  <Settings size={16} />
                  <span>Cập nhật tiến độ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
