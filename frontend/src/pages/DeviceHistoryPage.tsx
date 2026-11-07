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
  IncidentReported: { label: 'Báo cáo sự cố', className: 'badge badge-amber' },
  IncidentStatusUpdated: { label: 'Tiến độ sự cố', className: 'badge badge-blue' },
  RepairOrderCreated: { label: 'Tạo lệnh sửa chữa', className: 'badge badge-purple' },
  RepairOrderAssigned: { label: 'Phân công kỹ thuật', className: 'badge badge-blue' },
  RepairStatusUpdated: { label: 'Tiến độ sửa chữa', className: 'badge badge-purple' },
}

export function formatHistoryDescription(desc?: string | null): string {
  if (!desc) return '-'

  let formatted = desc

  // Legacy assignment descriptions
  formatted = formatted.replace(
    /^User\s+[a-fA-F0-9-]+\s+accepted assignment\./i,
    'Nhân viên đã tiếp nhận thiết bị.'
  )
  formatted = formatted.replace(
    /^User\s+[a-fA-F0-9-]+\s+rejected assignment\./i,
    'Nhân viên từ chối tiếp nhận thiết bị.'
  )
  formatted = formatted.replace(
    /^User\s+[a-fA-F0-9-]+\s+returned device\./i,
    'Thiết bị đã được hoàn trả bởi nhân viên.'
  )
  formatted = formatted.replace(
    /^Device assigned to user\s+[a-fA-F0-9-]+\s+and waiting for acceptance\./i,
    'Thiết bị đã được bàn giao cho nhân viên và đang chờ tiếp nhận.'
  )
  formatted = formatted.replace(
    /^Assignment revoked(?:\s+by user\s+[a-fA-F0-9-]+)?\./i,
    'Phiếu bàn giao thiết bị đã bị thu hồi.'
  )

  // Status recalculated legacy patterns
  formatted = formatted.replace(
    /^Device status recalculated from\s+(\w+)\s+to\s+(\w+)\.?/i,
    (_, oldSt, newSt) => {
      const mapStatus = (s: string) => {
        switch (s.toLowerCase()) {
          case 'available':
            return 'Sẵn sàng sử dụng'
          case 'pendingassignment':
            return 'Chờ duyệt bàn giao'
          case 'inuse':
            return 'Đang sử dụng'
          case 'underrepair':
            return 'Đang sửa chữa'
          case 'disposed':
            return 'Đã thanh lý'
          default:
            return s
        }
      }
      return `Trạng thái thiết bị tự động cập nhật từ '${mapStatus(oldSt)}' sang '${mapStatus(newSt)}'.`
    }
  )

  // Substring enum translations in descriptions
  formatted = formatted.replace(/\(Mức độ:\s*Low\)/gi, '(Mức độ: Thấp)')
  formatted = formatted.replace(/\(Mức độ:\s*Medium\)/gi, '(Mức độ: Trung bình)')
  formatted = formatted.replace(/\(Mức độ:\s*High\)/gi, '(Mức độ: Cao)')
  formatted = formatted.replace(/\(Mức độ:\s*Critical\)/gi, '(Mức độ: Khẩn cấp)')

  formatted = formatted.replace(/sang InProgress\b/gi, 'sang Đang xử lý')
  formatted = formatted.replace(/sang Completed\b/gi, 'sang Hoàn thành')
  formatted = formatted.replace(/sang Cancelled\b/gi, 'sang Đã hủy')
  formatted = formatted.replace(/sang Closed\b/gi, 'sang Đã đóng')
  formatted = formatted.replace(/sang Assigned\b/gi, 'sang Đã phân công')
  formatted = formatted.replace(/sang Reported\b/gi, 'sang Mới báo cáo')

  // Individual device status enums in Vietnamese text
  formatted = formatted.replace(/\bAvailable\b/g, 'Sẵn sàng sử dụng')
  formatted = formatted.replace(/\bPendingAssignment\b/g, 'Chờ duyệt bàn giao')
  formatted = formatted.replace(/\bInUse\b/g, 'Đang sử dụng')
  formatted = formatted.replace(/\bUnderRepair\b/g, 'Đang sửa chữa')
  formatted = formatted.replace(/\bDisposed\b/g, 'Đã thanh lý')

  return formatted
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
          <div className="stat-card-title">Sự cố & Sửa chữa</div>
          <div className="stat-card-value" style={{ color: '#7c3aed' }}>
            {historyItems.filter(h => h.action.startsWith('Incident') || h.action.startsWith('Repair')).length}
          </div>
          <div className="stat-card-sub">Bảo trì và khắc phục</div>
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
              <option value="IncidentReported">Báo cáo sự cố</option>
              <option value="IncidentStatusUpdated">Tiến độ sự cố</option>
              <option value="RepairOrderCreated">Tạo lệnh sửa chữa</option>
              <option value="RepairOrderAssigned">Phân công kỹ thuật</option>
              <option value="RepairStatusUpdated">Tiến độ sửa chữa</option>
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
                  <th style={{ width: '135px', whiteSpace: 'nowrap' }}>Thời gian</th>
                  <th style={{ width: '170px' }}>Thiết bị</th>
                  <th style={{ width: '145px', whiteSpace: 'nowrap' }}>Hành động</th>
                  <th style={{ width: '210px', whiteSpace: 'nowrap' }}>Chuyển dịch trạng thái</th>
                  <th>Mô tả chi tiết</th>
                  <th style={{ width: '135px', whiteSpace: 'nowrap' }}>Người thực hiện</th>
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

                  const deviceCode = item.deviceName?.includes(' - ')
                    ? item.deviceName.split(' - ')[0]
                    : item.deviceName || item.deviceId
                  const deviceName = item.deviceName?.includes(' - ')
                    ? item.deviceName.split(' - ').slice(1).join(' - ')
                    : null

                  return (
                    <tr key={item.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={12} />
                          <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Laptop size={13} color="var(--primary)" />
                            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary)' }}>
                              {deviceCode}
                            </span>
                          </div>
                          {deviceName && (
                            <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.2 }}>
                              {deviceName}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={actionBadge.className} style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                          {actionBadge.label}
                        </span>
                      </td>

                      <td style={{ whiteSpace: 'nowrap' }}>
                        {oldBadge && newBadge ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                            <span className={oldBadge.className} style={{ fontSize: '11px', padding: '2px 7px' }}>
                              {oldBadge.text}
                            </span>
                            <span style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>&rarr;</span>
                            <span className={newBadge.className} style={{ fontSize: '11px', padding: '2px 7px' }}>
                              {newBadge.text}
                            </span>
                          </div>
                        ) : newBadge ? (
                          <span className={newBadge.className} style={{ fontSize: '11px', padding: '2px 7px' }}>
                            {newBadge.text}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted-foreground)' }}>-</span>
                        )}
                      </td>

                      <td style={{ fontSize: '13px', lineHeight: 1.45 }}>
                        {formatHistoryDescription(item.description)}
                      </td>

                      <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                        {item.createdByUserName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <UserIcon size={13} color="var(--muted-foreground)" />
                            <span style={{ fontWeight: 500, fontSize: '12.5px' }}>{item.createdByUserName}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--muted-foreground)', fontSize: '12.5px' }}>Hệ thống</span>
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
