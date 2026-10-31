import { useEffect, useState, useMemo } from 'react'
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Plus,
  Search,
  Wrench,
  X,
  Filter,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  createIncident,
  createRepairOrder,
  getDevices,
  getIncidents,
  getUsers,
  updateIncidentStatus,
} from '../services/resources'
import type {
  Device,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  User,
} from '../types'
import { Pagination } from '../components/Pagination'

const severityBadge: Record<IncidentSeverity, { text: string; className: string }> = {
  1: { text: 'Thấp', className: 'badge badge-gray' },
  2: { text: 'Trung bình', className: 'badge badge-blue' },
  3: { text: 'Cao', className: 'badge badge-amber' },
  4: { text: 'Nghiêm trọng', className: 'badge badge-red' },
}

const statusBadge: Record<IncidentStatus, { text: string; className: string }> = {
  1: { text: 'Mới báo cáo', className: 'badge badge-amber' },
  2: { text: 'Đang xem xét', className: 'badge badge-purple' },
  3: { text: 'Đã duyệt', className: 'badge badge-blue' },
  4: { text: 'Từ chối', className: 'badge badge-red' },
  5: { text: 'Đã giải quyết', className: 'badge badge-green' },
  6: { text: 'Đã đóng', className: 'badge badge-gray' },
}

export function IncidentsPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const isAdmin = profile?.role?.toLowerCase() === 'admin'
  const isTechnician = profile?.role?.toLowerCase() === 'technician'

  const [items, setItems] = useState<Incident[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Modals
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [openStatusModal, setOpenStatusModal] = useState(false)
  const [openRepairModal, setOpenRepairModal] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Forms
  const [createForm, setCreateForm] = useState({
    deviceId: '',
    title: '',
    description: '',
    severity: 2 as IncidentSeverity,
  })

  const [statusForm, setStatusForm] = useState({
    status: 2 as IncidentStatus,
    severity: 2 as IncidentSeverity,
    resolutionNotes: '',
  })

  const [repairForm, setRepairForm] = useState({
    code: '',
    assignedToUserId: '',
    priority: 2,
    estimatedCost: '',
    description: '',
  })

  useEffect(() => {
    void loadInitialData()
  }, [])

  useEffect(() => {
    void loadIncidents()
  }, [page, pageSize, statusFilter, severityFilter, searchTerm])

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

  async function loadIncidents() {
    setLoading(true)
    setError('')
    try {
      const data = await getIncidents({
        keyword: searchTerm.trim() || undefined,
        status: statusFilter ? Number(statusFilter) : undefined,
        severity: severityFilter ? Number(severityFilter) : undefined,
        page,
        pageSize,
      })
      setItems(data.items)
      setTotalItems(data.totalItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách sự cố')
    } finally {
      setLoading(false)
    }
  }

  // Summary counts
  const stats = useMemo(() => {
    const total = totalItems
    const pending = items.filter(i => i.status === 1 || i.status === 2).length
    const approved = items.filter(i => i.status === 3).length
    const resolved = items.filter(i => i.status === 5 || i.status === 6).length
    return { total, pending, approved, resolved }
  }, [items, totalItems])

  // Technician list for repair assignment
  const technicians = useMemo(() => {
    return users.filter(u => u.role?.toLowerCase() === 'technician')
  }, [users])

  async function handleCreateIncident(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.deviceId) {
      setError('Vui lòng chọn thiết bị.')
      return
    }
    if (!createForm.title.trim()) {
      setError('Vui lòng nhập tiêu đề sự cố.')
      return
    }
    if (!createForm.description.trim()) {
      setError('Vui lòng nhập mô tả chi tiết.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await createIncident({
        deviceId: createForm.deviceId,
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        severity: createForm.severity,
      })
      setOpenCreateModal(false)
      setCreateForm({
        deviceId: devices[0]?.id || '',
        title: '',
        description: '',
        severity: 2,
      })
      setSuccessMsg('Báo cáo sự cố thành công!')
      setTimeout(() => setSuccessMsg(''), 4000)
      await loadIncidents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo báo cáo sự cố')
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenStatusModal(incident: Incident) {
    setSelectedIncident(incident)
    setStatusForm({
      status: incident.status,
      severity: incident.severity,
      resolutionNotes: incident.resolutionNotes || '',
    })
    setOpenStatusModal(true)
  }

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedIncident) return

    setSubmitting(true)
    setError('')
    try {
      await updateIncidentStatus(selectedIncident.id, {
        status: statusForm.status,
        severity: statusForm.severity,
        resolutionNotes: statusForm.resolutionNotes.trim() || null,
      })
      setOpenStatusModal(false)
      setSuccessMsg('Cập nhật trạng thái sự cố thành công!')
      setTimeout(() => setSuccessMsg(''), 4000)
      await loadIncidents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái')
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenRepairModal(incident: Incident) {
    setSelectedIncident(incident)
    setRepairForm({
      code: `SC-${Date.now().toString().slice(-6)}`,
      assignedToUserId: technicians[0]?.id || '',
      priority: incident.severity as number,
      estimatedCost: '',
      description: `Khắc phục sự cố: ${incident.title}. ${incident.description}`,
    })
    setOpenRepairModal(true)
  }

  async function handleCreateRepairFromIncident(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedIncident) return

    setSubmitting(true)
    setError('')
    try {
      await createRepairOrder({
        code: repairForm.code.trim() || undefined,
        incidentId: selectedIncident.id,
        deviceId: selectedIncident.deviceId,
        assignedToUserId: repairForm.assignedToUserId || undefined,
        priority: repairForm.priority as any,
        estimatedCost: repairForm.estimatedCost ? parseFloat(repairForm.estimatedCost) : undefined,
        description: repairForm.description.trim(),
      })
      setOpenRepairModal(false)
      setSuccessMsg('Đã tạo Lệnh sửa chữa thành công!')
      setTimeout(() => setSuccessMsg(''), 4000)
      await loadIncidents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo lệnh sửa chữa')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1>Báo cáo sự cố</h1>
          <p>Ghi nhận và điều phối xử lý sự cố thiết bị doanh nghiệp</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setError('')
            setOpenCreateModal(true)
          }}
        >
          <Plus size={16} />
          <span>Báo cáo sự cố</span>
        </button>
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
          <div className="stat-card-title">Tổng số sự cố</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-sub">Tất cả báo cáo</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Chờ xử lý</div>
          <div className="stat-card-value" style={{ color: '#d97706' }}>{stats.pending}</div>
          <div className="stat-card-sub">Mới báo cáo hoặc đang duyệt</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đã phê duyệt</div>
          <div className="stat-card-value" style={{ color: '#2563eb' }}>{stats.approved}</div>
          <div className="stat-card-sub">Chờ tạo lệnh sửa chữa</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đã giải quyết</div>
          <div className="stat-card-value" style={{ color: '#059669' }}>{stats.resolved}</div>
          <div className="stat-card-sub">Sự cố đã khắc phục/đóng</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header-clean">
          <div className="card-title">Danh sách sự cố kỹ thuật</div>
          <div className="card-description">
            Hiển thị {items.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(page * pageSize, totalItems)} trong tổng số {totalItems} sự cố
          </div>
        </div>

        {/* Filters */}
        <div className="toolbar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              className="input"
              placeholder="Tìm theo thiết bị, tiêu đề, người báo cáo..."
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
              <option value="1">Mới báo cáo</option>
              <option value="2">Đang xem xét</option>
              <option value="3">Đã duyệt</option>
              <option value="4">Từ chối</option>
              <option value="5">Đã giải quyết</option>
              <option value="6">Đã đóng</option>
            </select>

            <select
              className="select"
              value={severityFilter}
              onChange={e => {
                setPage(1)
                setSeverityFilter(e.target.value)
              }}
            >
              <option value="">Tất cả mức độ</option>
              <option value="1">Thấp</option>
              <option value="2">Trung bình</option>
              <option value="3">Cao</option>
              <option value="4">Nghiêm trọng</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            Đang tải dữ liệu sự cố...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thiết bị</th>
                  <th>Tiêu đề sự cố</th>
                  <th>Mức độ</th>
                  <th>Người báo cáo</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Lệnh SC</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                      Không tìm thấy sự cố nào
                    </td>
                  </tr>
                ) : (
                  items.map(incident => (
                    <tr key={incident.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{incident.deviceCode || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          {incident.deviceName}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, maxWidth: '220px', wordBreak: 'break-word' }}>
                          {incident.title}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--muted-foreground)',
                            maxWidth: '220px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {incident.description}
                        </div>
                      </td>
                      <td>
                        <span className={severityBadge[incident.severity]?.className || 'badge'}>
                          {severityBadge[incident.severity]?.text || incident.severity}
                        </span>
                      </td>
                      <td>
                        <div>{incident.reportedByUserName || 'N/A'}</div>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {new Date(incident.reportedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td>
                        <span className={statusBadge[incident.status]?.className || 'badge'}>
                          {statusBadge[incident.status]?.text || incident.status}
                        </span>
                      </td>
                      <td>
                        {incident.hasRepairOrder ? (
                          <span className="badge badge-green" title="Đã có lệnh sửa chữa">
                            Có lệnh
                          </span>
                        ) : (
                          <span className="badge badge-gray">Chưa có</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {/* Xem chi tiết */}
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Chi tiết sự cố"
                            onClick={() => {
                              setSelectedIncident(incident)
                              setOpenDetailModal(true)
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Phê duyệt / Cập nhật trạng thái (Admin only) */}
                          {isAdmin && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              title="Cập nhật trạng thái"
                              onClick={() => handleOpenStatusModal(incident)}
                            >
                              <Filter size={14} />
                            </button>
                          )}

                          {/* Tạo Lệnh sửa chữa (Admin only, khi sự cố đã Approved và chưa có RepairOrder) */}
                          {isAdmin && incident.status === 3 && !incident.hasRepairOrder && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              title="Tạo Lệnh sửa chữa"
                              onClick={() => handleOpenRepairModal(incident)}
                            >
                              <Wrench size={14} />
                            </button>
                          )}

                          {/* Nếu là Admin/Tech và sự cố đã có Lệnh sửa chữa -> Nút sang xem lệnh */}
                          {(isAdmin || isTechnician) && incident.hasRepairOrder && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              title="Xem Lệnh sửa chữa"
                              onClick={() => navigate('/repairs')}
                            >
                              <Wrench size={14} />
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

      {/* Modal 1: Báo cáo sự cố mới */}
      {openCreateModal && (
        <div className="modal-backdrop" onClick={() => setOpenCreateModal(false)}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Báo cáo sự cố thiết bị</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setOpenCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateIncident}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Chọn thiết bị *</label>
                  <select
                    className="select"
                    value={createForm.deviceId}
                    onChange={e => setCreateForm({ ...createForm, deviceId: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn thiết bị gặp sự cố --</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Tiêu đề sự cố *</label>
                  <input
                    className="input"
                    placeholder="VD: Màn hình không lên nguồn, bàn phím liệt phím..."
                    value={createForm.title}
                    onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Mức độ nghiêm trọng *</label>
                  <select
                    className="select"
                    value={createForm.severity}
                    onChange={e =>
                      setCreateForm({ ...createForm, severity: Number(e.target.value) as IncidentSeverity })
                    }
                  >
                    <option value="1">Thấp (Vẫn dùng được bình thường)</option>
                    <option value="2">Trung bình (Ảnh hưởng một phần chức năng)</option>
                    <option value="3">Cao (Không thể làm việc bình thường)</option>
                    <option value="4">Nghiêm trọng (Hỏng hoàn toàn, có nguy cơ chập cháy)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Mô tả chi tiết sự cố *</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Mô tả cụ thể hiện tượng gặp phải, thời điểm phát sinh, các thao tác đã thử..."
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
                  {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Chi tiết sự cố */}
      {openDetailModal && selectedIncident && (
        <div className="modal-backdrop" onClick={() => setOpenDetailModal(false)}>
          <div className="modal-container" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết sự cố</h3>
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
                <span className="detail-label">Thiết bị:</span>
                <span className="detail-value" style={{ fontWeight: 600 }}>
                  {selectedIncident.deviceCode} - {selectedIncident.deviceName}
                </span>

                <span className="detail-label">Tiêu đề:</span>
                <span className="detail-value">{selectedIncident.title}</span>

                <span className="detail-label">Mức độ:</span>
                <span className="detail-value">
                  <span className={severityBadge[selectedIncident.severity]?.className || 'badge'}>
                    {severityBadge[selectedIncident.severity]?.text}
                  </span>
                </span>

                <span className="detail-label">Trạng thái:</span>
                <span className="detail-value">
                  <span className={statusBadge[selectedIncident.status]?.className || 'badge'}>
                    {statusBadge[selectedIncident.status]?.text}
                  </span>
                </span>

                <span className="detail-label">Người báo cáo:</span>
                <span className="detail-value">{selectedIncident.reportedByUserName}</span>

                <span className="detail-label">Ngày báo cáo:</span>
                <span className="detail-value">
                  {new Date(selectedIncident.reportedAt).toLocaleString('vi-VN')}
                </span>

                {selectedIncident.resolvedAt && (
                  <>
                    <span className="detail-label">Ngày giải quyết:</span>
                    <span className="detail-value">
                      {new Date(selectedIncident.resolvedAt).toLocaleString('vi-VN')}
                    </span>
                  </>
                )}

                <span className="detail-label">Mô tả sự cố:</span>
                <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedIncident.description}
                </span>

                {selectedIncident.resolutionNotes && (
                  <>
                    <span className="detail-label">Ghi chú xử lý:</span>
                    <span className="detail-value" style={{ whiteSpace: 'pre-wrap', color: '#059669' }}>
                      {selectedIncident.resolutionNotes}
                    </span>
                  </>
                )}

                <span className="detail-label">Lệnh sửa chữa:</span>
                <span className="detail-value">
                  {selectedIncident.hasRepairOrder ? (
                    <span className="badge badge-green">Đã lập lệnh</span>
                  ) : (
                    <span className="badge badge-gray">Chưa lập</span>
                  )}
                </span>
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
              {isAdmin && selectedIncident.status === 3 && !selectedIncident.hasRepairOrder && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setOpenDetailModal(false)
                    handleOpenRepairModal(selectedIncident)
                  }}
                >
                  <Wrench size={16} />
                  <span>Tạo lệnh sửa chữa</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Cập nhật trạng thái sự cố (Admin) */}
      {openStatusModal && selectedIncident && (
        <div className="modal-backdrop" onClick={() => setOpenStatusModal(false)}>
          <div className="modal-container" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cập nhật trạng thái sự cố</h3>
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
                  <strong>Thiết bị:</strong> {selectedIncident.deviceCode} - {selectedIncident.deviceName}
                  <br />
                  <strong>Sự cố:</strong> {selectedIncident.title}
                </div>

                <div className="form-group">
                  <label className="label">Trạng thái mới *</label>
                  <select
                    className="select"
                    value={statusForm.status}
                    onChange={e =>
                      setStatusForm({ ...statusForm, status: Number(e.target.value) as IncidentStatus })
                    }
                  >
                    <option value="2">Đang xem xét (In Review)</option>
                    <option value="3">Phê duyệt (Approved)</option>
                    <option value="4">Từ chối (Rejected)</option>
                    <option value="5">Đã giải quyết (Resolved)</option>
                    <option value="6">Đóng sự cố (Closed)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Điều chỉnh mức độ nghiêm trọng</label>
                  <select
                    className="select"
                    value={statusForm.severity}
                    onChange={e =>
                      setStatusForm({ ...statusForm, severity: Number(e.target.value) as IncidentSeverity })
                    }
                  >
                    <option value="1">Thấp</option>
                    <option value="2">Trung bình</option>
                    <option value="3">Cao</option>
                    <option value="4">Nghiêm trọng</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Ghi chú giải quyết / Lý do</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Nhập ghi chú phản hồi cho nhân viên..."
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
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Tạo Lệnh sửa chữa từ Sự cố (Admin) */}
      {openRepairModal && selectedIncident && (
        <div className="modal-backdrop" onClick={() => setOpenRepairModal(false)}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo Lệnh sửa chữa từ sự cố</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setOpenRepairModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateRepairFromIncident}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px', fontSize: '14px' }}>
                  <strong>Thiết bị:</strong> {selectedIncident.deviceCode} - {selectedIncident.deviceName}
                  <br />
                  <strong>Sự cố liên quan:</strong> {selectedIncident.title}
                </div>

                <div className="form-group">
                  <label className="label">Mã lệnh sửa chữa</label>
                  <input
                    className="input"
                    placeholder="Mã tự sinh nếu để trống (VD: SC-xxxx)"
                    value={repairForm.code}
                    onChange={e => setRepairForm({ ...repairForm, code: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Chỉ định kỹ thuật viên</label>
                  <select
                    className="select"
                    value={repairForm.assignedToUserId}
                    onChange={e => setRepairForm({ ...repairForm, assignedToUserId: e.target.value })}
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
                    value={repairForm.priority}
                    onChange={e => setRepairForm({ ...repairForm, priority: Number(e.target.value) })}
                  >
                    <option value="1">Thấp</option>
                    <option value="2">Trung bình</option>
                    <option value="3">Cao</option>
                    <option value="4">Khẩn cấp</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Chi phí ước tính (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="input"
                    placeholder="VD: 500000"
                    value={repairForm.estimatedCost}
                    onChange={e => setRepairForm({ ...repairForm, estimatedCost: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Nội dung sửa chữa *</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={repairForm.description}
                    onChange={e => setRepairForm({ ...repairForm, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setOpenRepairModal(false)}
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
    </div>
  )
}
