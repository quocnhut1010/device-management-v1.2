import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Package,
  AlertCircle,
  X,
  Laptop,
  History as HistoryIcon,
  Clock,
  User,
} from 'lucide-react'
import { getDevices, createDevice, deleteDevice, getDashboardStats, getDeviceHistory } from '../services/resources'
import type { Device, DeviceHistory, DeviceStatus, DashboardStats } from '../types'
import { Pagination } from '../components/Pagination'
import { useAuth } from '../contexts/AuthContext'

const deviceStatusConfig: Record<DeviceStatus, { text: string; className: string }> = {
  1: { text: 'Chưa cấp phát', className: 'badge badge-green' },
  2: { text: 'Chờ duyệt bàn giao', className: 'badge badge-amber' },
  3: { text: 'Đang sử dụng', className: 'badge badge-blue' },
  4: { text: 'Đang sửa chữa', className: 'badge badge-purple' },
  5: { text: 'Đã thanh lý', className: 'badge badge-red' },
}

const historyActionConfig: Record<string, { label: string; className: string }> = {
  DeviceCreated: { label: 'Khởi tạo thiết bị', className: 'badge badge-green' },
  DeviceUpdated: { label: 'Cập nhật thiết bị', className: 'badge badge-blue' },
  AssignmentCreated: { label: 'Tạo phiếu bàn giao', className: 'badge badge-amber' },
  AssignmentAccepted: { label: 'Đã nhận thiết bị', className: 'badge badge-green' },
  AssignmentRejected: { label: 'Từ chối nhận thiết bị', className: 'badge badge-red' },
  AssignmentReturned: { label: 'Hoàn trả thiết bị', className: 'badge badge-purple' },
  AssignmentRevoked: { label: 'Thu hồi bàn giao', className: 'badge badge-gray' },
  StatusRecalculated: { label: 'Cập nhật trạng thái', className: 'badge badge-blue' },
}

export function DevicesPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role?.toLowerCase() === 'admin'

  const [items, setItems] = useState<Device[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Dialog states
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [openHistoryModal, setOpenHistoryModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // History state (Phase 9)
  const [historyItems, setHistoryItems] = useState<DeviceHistory[]>([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalItems, setHistoryTotalItems] = useState(0)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const [createForm, setCreateForm] = useState({
    code: '',
    name: '',
    serialNumber: '',
    category: '',
    model: '',
  })

  useEffect(() => {
    void loadStatsData()
  }, [])

  useEffect(() => {
    const id = setTimeout(() => {
      void loadData()
    }, 250)
    return () => clearTimeout(id)
  }, [page, keyword, status])

  async function loadStatsData() {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch {
      // quiet
    }
  }

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const data = await getDevices({ page, pageSize, keyword, status })
      setItems(data.items)
      setTotalItems(data.totalItems)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể tải danh sách thiết bị.'
      setError(msg || 'Lỗi tải thiết bị')
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory(deviceId: string, targetPage: number) {
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const result = await getDeviceHistory(deviceId, { page: targetPage, pageSize: 10 })
      setHistoryItems(result.items)
      setHistoryTotalItems(result.totalItems)
      setHistoryPage(result.page)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Bạn không có quyền xem lịch sử thiết bị này hoặc xảy ra lỗi.'
      setHistoryError(msg || 'Không thể tải lịch sử thiết bị')
      setHistoryItems([])
      setHistoryTotalItems(0)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleOpenHistory = (device: Device) => {
    setSelectedDevice(device)
    setHistoryPage(1)
    setOpenHistoryModal(true)
    void loadHistory(device.id, 1)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.code || !createForm.name || !createForm.serialNumber) return

    setSubmitting(true)
    setError('')
    try {
      await createDevice(createForm)
      setOpenCreateModal(false)
      setCreateForm({ code: '', name: '', serialNumber: '', category: '', model: '' })
      await Promise.all([loadData(), loadStatsData()])
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Thêm thiết bị thất bại.'
      setError(msg || 'Lỗi thêm thiết bị')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này không?')) return
    try {
      await deleteDevice(id)
      await Promise.all([loadData(), loadStatsData()])
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Xóa thiết bị thất bại.'
      setError(msg || 'Lỗi xóa thiết bị')
    }
  }

  const handleOpenDetail = (device: Device) => {
    setSelectedDevice(device)
    setOpenDetailModal(true)
  }

  return (
    <div>
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h1>Quản lý thiết bị</h1>
          <p>Quản lý tất cả thiết bị và tra cứu lịch sử vòng đời trong hệ thống</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpenCreateModal(true)}
          >
            <Plus size={16} />
            <span>Thêm thiết bị</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Statistics Cards phản ánh số liệu thực từ Database (Phase 8) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Tổng số thiết bị</div>
          <div className="stat-card-value">{stats?.totalDevices ?? totalItems}</div>
          <div className="stat-card-sub">Tổng tài sản quản lý</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đang sử dụng</div>
          <div className="stat-card-value" style={{ color: '#2563eb' }}>{stats?.inUseDevices ?? 0}</div>
          <div className="stat-card-sub">Đã bàn giao nhân viên</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Chưa cấp phát</div>
          <div className="stat-card-value" style={{ color: '#059669' }}>{stats?.availableDevices ?? 0}</div>
          <div className="stat-card-sub">Sẵn sàng trong kho</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đang sửa chữa</div>
          <div className="stat-card-value" style={{ color: '#7c3aed' }}>{stats?.underRepairDevices ?? 0}</div>
          <div className="stat-card-sub">Bảo trì kỹ thuật</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header-clean">
          <div className="card-title">Danh sách thiết bị</div>
          <div className="card-description">
            Hiển thị danh sách thiết bị và tài sản công ty
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              className="input"
              placeholder="Tìm theo mã thiết bị, tên, số serial..."
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
            <option value="1">Chưa cấp phát (Sẵn sàng)</option>
            <option value="2">Chờ duyệt bàn giao</option>
            <option value="3">Đang sử dụng</option>
            <option value="4">Đang sửa chữa</option>
            <option value="5">Đã thanh lý</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            Đang tải dữ liệu thiết bị...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã thiết bị</th>
                  <th>Tên thiết bị</th>
                  <th>Số Serial</th>
                  <th>Danh mục</th>
                  <th>Model</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const badge = deviceStatusConfig[item.status] || {
                    text: `Trạng thái ${item.status}`,
                    className: 'badge badge-gray',
                  }
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.code}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Laptop size={16} color="var(--primary)" />
                          <span style={{ fontWeight: 500 }}>{item.name}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--muted-foreground)' }}>
                        {item.serialNumber}
                      </td>
                      <td>{item.category || '-'}</td>
                      <td>{item.model || '-'}</td>
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
                          <button
                            type="button"
                            className="btn-icon"
                            title="Xem lịch sử thiết bị (Phase 9)"
                            onClick={() => handleOpenHistory(item)}
                          >
                            <HistoryIcon size={15} />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              className="btn-icon btn-icon-danger"
                              title="Xóa thiết bị"
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
                      <Package size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                      <div>Không tìm thấy thiết bị nào phù hợp.</div>
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

      {/* Modal Dialog: Thêm thiết bị mới */}
      {openCreateModal && (
        <div className="modal-backdrop" onClick={() => setOpenCreateModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm thiết bị mới</h3>
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
                  <label className="form-label">Mã thiết bị *</label>
                  <input
                    className="input"
                    placeholder="Ví dụ: DEV002"
                    value={createForm.code}
                    onChange={e => setCreateForm({ ...createForm, code: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tên thiết bị *</label>
                  <input
                    className="input"
                    placeholder="Ví dụ: MacBook Pro 14 M3"
                    value={createForm.name}
                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số Serial *</label>
                  <input
                    className="input"
                    placeholder="Ví dụ: SN-MBP14-001"
                    value={createForm.serialNumber}
                    onChange={e => setCreateForm({ ...createForm, serialNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Danh mục</label>
                  <input
                    className="input"
                    placeholder="Ví dụ: Laptop"
                    value={createForm.category}
                    onChange={e => setCreateForm({ ...createForm, category: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input
                    className="input"
                    placeholder="Ví dụ: 2024"
                    value={createForm.model}
                    onChange={e => setCreateForm({ ...createForm, model: e.target.value })}
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
                  disabled={submitting || !createForm.code || !createForm.name || !createForm.serialNumber}
                >
                  <Plus size={16} />
                  <span>{submitting ? 'Đang lưu...' : 'Lưu thiết bị'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog: Xem chi tiết thiết bị */}
      {openDetailModal && selectedDevice && (
        <div className="modal-backdrop" onClick={() => setOpenDetailModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết thiết bị</h3>
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
                <span className="detail-label">Mã thiết bị:</span>
                <span className="detail-value" style={{ fontWeight: 700 }}>
                  {selectedDevice.code}
                </span>

                <span className="detail-label">Tên thiết bị:</span>
                <span className="detail-value">{selectedDevice.name}</span>

                <span className="detail-label">Số Serial:</span>
                <span className="detail-value" style={{ fontFamily: 'monospace' }}>
                  {selectedDevice.serialNumber}
                </span>

                <span className="detail-label">Danh mục:</span>
                <span className="detail-value">{selectedDevice.category || '-'}</span>

                <span className="detail-label">Model:</span>
                <span className="detail-value">{selectedDevice.model || '-'}</span>

                <span className="detail-label">Trạng thái:</span>
                <span className="detail-value">
                  <span className={deviceStatusConfig[selectedDevice.status]?.className}>
                    {deviceStatusConfig[selectedDevice.status]?.text}
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

      {/* Modal Dialog: Xem Lịch Sử Thiết Bị (Phase 9: Device History) */}
      {openHistoryModal && selectedDevice && (
        <div className="modal-backdrop" onClick={() => setOpenHistoryModal(false)}>
          <div className="modal-container" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HistoryIcon size={18} color="var(--primary)" />
                <h3 style={{ margin: 0 }}>Lịch sử hoạt động: {selectedDevice.name}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setOpenHistoryModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '480px', overflowY: 'auto' }}>
              <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>
                Mã thiết bị: <strong>{selectedDevice.code}</strong> | Serial: <code>{selectedDevice.serialNumber}</code>
              </div>

              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--muted-foreground)' }}>
                  Đang tải lịch sử thiết bị...
                </div>
              ) : historyError ? (
                <div className="alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{historyError}</span>
                </div>
              ) : historyItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-foreground)' }}>
                  <Clock size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                  <div>Chưa có dữ liệu lịch sử nào cho thiết bị này.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {historyItems.map((entry) => {
                    const actionBadge = historyActionConfig[entry.action] || {
                      label: entry.action,
                      className: 'badge badge-gray',
                    }
                    const oldBadge = entry.oldStatus ? deviceStatusConfig[entry.oldStatus] : null
                    const newBadge = entry.newStatus ? deviceStatusConfig[entry.newStatus] : null

                    return (
                      <div
                        key={entry.id}
                        style={{
                          padding: '12px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          backgroundColor: 'var(--secondary)',
                          fontSize: '13px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span className={actionBadge.className} style={{ fontWeight: 600 }}>
                            {actionBadge.label}
                          </span>
                          <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
                            {new Date(entry.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        {entry.description && (
                          <div style={{ margin: '6px 0', color: 'var(--foreground)' }}>
                            {entry.description}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--border)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          <div>
                            {oldBadge && newBadge ? (
                              <span>
                                Trạng thái: <span className={oldBadge.className}>{oldBadge.text}</span> &rarr; <span className={newBadge.className}>{newBadge.text}</span>
                              </span>
                            ) : newBadge ? (
                              <span>
                                Trạng thái mới: <span className={newBadge.className}>{newBadge.text}</span>
                              </span>
                            ) : null}
                          </div>
                          {entry.createdByUserName && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={12} />
                              <span>{entry.createdByUserName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {historyTotalItems > 10 && (
                <div style={{ marginTop: '16px' }}>
                  <Pagination
                    page={historyPage}
                    pageSize={10}
                    totalItems={historyTotalItems}
                    onPageChange={(p) => void loadHistory(selectedDevice.id, p)}
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpenHistoryModal(false)}
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
