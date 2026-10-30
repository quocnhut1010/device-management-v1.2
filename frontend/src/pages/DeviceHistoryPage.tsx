import { useEffect, useState } from 'react'
import {
  History,
  Search,
  Laptop,
  Clock,
  User as UserIcon,
  Filter,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { getAllDeviceHistories, getDevices } from '../services/resources'
import type { Device, DeviceHistory, DeviceStatus } from '../types'
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

export function DeviceHistoryPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role?.toLowerCase() === 'admin'

  const [historyItems, setHistoryItems] = useState<DeviceHistory[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(15)
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDevices() {
      try {
        const res = await getDevices({ page: 1, pageSize: 100 })
        setDevices(res.items)
      } catch {
        // quiet
      }
    }
    void loadDevices()
  }, [])

  useEffect(() => {
    void loadHistoryData()
  }, [page, selectedDeviceId])

  async function loadHistoryData() {
    setLoading(true)
    setError('')
    try {
      const data = await getAllDeviceHistories({
        deviceId: selectedDeviceId || undefined,
        page,
        pageSize,
      })
      setHistoryItems(data.items)
      setTotalItems(data.totalItems)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể tải lịch sử thiết bị.'
      setError(msg || 'Lỗi tải lịch sử')
      setHistoryItems([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  // Filter items in memory by action if user filters by action
  const filteredItems = selectedAction
    ? historyItems.filter(h => h.action === selectedAction)
    : historyItems

  return (
    <div>
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={24} color="var(--primary)" />
            <h1 style={{ margin: 0 }}>Lịch sử thiết bị (Audit Log)</h1>
          </div>
          <p style={{ marginTop: '4px' }}>
            Truy vết toàn bộ nhật ký vòng đời, cấp phát, hoàn trả và biến động trạng thái thiết bị trong hệ thống
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void loadHistoryData()}
          disabled={loading}
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Tổng số bản ghi</div>
          <div className="stat-card-value">{totalItems}</div>
          <div className="stat-card-sub">Toàn bộ sự kiện hệ thống</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Khởi tạo & Cập nhật</div>
          <div className="stat-card-value" style={{ color: '#059669' }}>
            {historyItems.filter(h => h.action === 'DeviceCreated' || h.action === 'DeviceUpdated').length}
          </div>
          <div className="stat-card-sub">Bản ghi thiết bị</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Luồng Bàn giao</div>
          <div className="stat-card-value" style={{ color: '#2563eb' }}>
            {historyItems.filter(h => h.action.startsWith('Assignment')).length}
          </div>
          <div className="stat-card-sub">Cấp phát, nhận, hoàn trả</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Tự động Recalculate</div>
          <div className="stat-card-value" style={{ color: '#7c3aed' }}>
            {historyItems.filter(h => h.action === 'StatusRecalculated').length}
          </div>
          <div className="stat-card-sub">Chuyển trạng thái an toàn</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        <div className="card-header-clean">
          <div className="card-title">Nhật ký hoạt động thiết bị</div>
          <div className="card-description">
            {isAdmin
              ? 'Toàn bộ dòng thời gian thao tác tác động lên thiết bị trong doanh nghiệp.'
              : 'Lịch sử hoạt động của các thiết bị được phân bổ cho bạn.'}
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
          {/* Device Dropdown Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '260px', flex: '1' }}>
            <Laptop size={16} color="var(--muted-foreground)" />
            <select
              className="select"
              value={selectedDeviceId}
              onChange={e => {
                setPage(1)
                setSelectedDeviceId(e.target.value)
              }}
              style={{ width: '100%' }}
            >
              <option value="">Tất cả thiết bị</option>
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
            <Filter size={16} color="var(--muted-foreground)" />
            <select
              className="select"
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Tất cả hành động</option>
              <option value="DeviceCreated">Khởi tạo thiết bị</option>
              <option value="DeviceUpdated">Cập nhật thiết bị</option>
              <option value="AssignmentCreated">Tạo phiếu bàn giao</option>
              <option value="AssignmentAccepted">Đã nhận thiết bị</option>
              <option value="AssignmentRejected">Từ chối nhận thiết bị</option>
              <option value="AssignmentReturned">Hoàn trả thiết bị</option>
              <option value="AssignmentRevoked">Thu hồi bàn giao</option>
              <option value="StatusRecalculated">Cập nhật trạng thái</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            Đang tải dữ liệu nhật ký lịch sử thiết bị...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--muted-foreground)' }}>
            <Clock size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
            <div style={{ fontSize: '15px', fontWeight: 500 }}>Chưa có bản ghi lịch sử nào phù hợp</div>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Các thao tác trên thiết bị sẽ tự động được ghi nhận tại đây.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Thiết bị</th>
                  <th>Hành động</th>
                  <th>Chuyển dịch trạng thái</th>
                  <th>Mô tả chi tiết</th>
                  <th>Người thực hiện</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const actionBadge = historyActionConfig[item.action] || {
                    label: item.action,
                    className: 'badge badge-gray',
                  }
                  const oldBadge = item.oldStatus ? deviceStatusConfig[item.oldStatus] : null
                  const newBadge = item.newStatus ? deviceStatusConfig[item.newStatus] : null

                  return (
                    <tr key={item.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} />
                          <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                      </td>

                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Laptop size={15} color="var(--primary)" />
                          <span>{item.deviceName || item.deviceId}</span>
                        </div>
                      </td>

                      <td>
                        <span className={actionBadge.className}>{actionBadge.label}</span>
                      </td>

                      <td>
                        {oldBadge && newBadge ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                            <span className={oldBadge.className}>{oldBadge.text}</span>
                            <span>&rarr;</span>
                            <span className={newBadge.className}>{newBadge.text}</span>
                          </div>
                        ) : newBadge ? (
                          <span className={newBadge.className}>{newBadge.text}</span>
                        ) : (
                          <span style={{ color: 'var(--muted-foreground)' }}>-</span>
                        )}
                      </td>

                      <td style={{ maxWidth: '320px', fontSize: '13px' }}>
                        {item.description || '-'}
                      </td>

                      <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                        {item.createdByUserName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserIcon size={14} color="var(--muted-foreground)" />
                            <span style={{ fontWeight: 500 }}>{item.createdByUserName}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--muted-foreground)' }}>Hệ thống</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
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
    </div>
  )
}
