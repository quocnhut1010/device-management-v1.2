import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  Users,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react'
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  deleteDepartment,
} from '../services/resources'
import type { Department } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/use-toast'
import { formatDate } from '../lib/dateUtils'

export function DepartmentsPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role?.toLowerCase() === 'admin'
  const { toast } = useToast()

  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [error, setError] = useState('')

  // Modal state
  const [openModal, setOpenModal] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formActive, setFormActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Delete confirm state
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const data = await getDepartments()
      setDepartments(data)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể tải danh sách phòng ban.'
      setError(msg || 'Lỗi tải phòng ban')
    } finally {
      setLoading(false)
    }
  }

  // Filtered list
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      const matchesKeyword =
        !keyword ||
        d.code.toLowerCase().includes(keyword.toLowerCase()) ||
        d.name.toLowerCase().includes(keyword.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && d.isActive) ||
        (statusFilter === 'inactive' && !d.isActive)

      return matchesKeyword && matchesStatus
    })
  }, [departments, keyword, statusFilter])

  // Statistics
  const stats = useMemo(() => {
    const total = departments.length
    const active = departments.filter(d => d.isActive).length
    const inactive = total - active
    const totalUsers = departments.reduce((acc, d) => acc + (d.userCount || 0), 0)
    return { total, active, inactive, totalUsers }
  }, [departments])

  const handleOpenCreate = () => {
    setEditingDept(null)
    setFormCode('')
    setFormName('')
    setFormActive(true)
    setOpenModal(true)
  }

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept)
    setFormCode(dept.code)
    setFormName(dept.name)
    setFormActive(dept.isActive)
    setOpenModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCode.trim() || !formName.trim()) {
      toast({
        title: 'Lỗi nhập liệu',
        description: 'Vui lòng nhập đầy đủ mã và tên phòng ban.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, {
          code: formCode.trim(),
          name: formName.trim(),
          isActive: formActive,
        })
        toast({
          title: 'Thành công',
          description: `Đã cập nhật phòng ban '${formName}'.`,
        })
      } else {
        await createDepartment({
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
          isActive: formActive,
        })
        toast({
          title: 'Thành công',
          description: `Đã tạo mới phòng ban '${formName}'.`,
        })
      }
      setOpenModal(false)
      await loadData()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Thao tác không thành công.'
      toast({
        title: 'Thất bại',
        description: msg || 'Lỗi khi lưu phòng ban',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (dept: Department) => {
    try {
      const updated = await toggleDepartmentStatus(dept.id)
      toast({
        title: 'Cập nhật trạng thái',
        description: `Phòng ban '${dept.name}' hiện đang ${updated.isActive ? 'hoạt động' : 'vô hiệu hóa'}.`,
      })
      await loadData()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể thay đổi trạng thái phòng ban.'
      toast({
        title: 'Thất bại',
        description: msg || 'Lỗi cập nhật',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return
    setDeleting(true)
    try {
      await deleteDepartment(deptToDelete.id)
      toast({
        title: 'Thành công',
        description: `Đã xóa phòng ban '${deptToDelete.name}'.`,
      })
      setDeptToDelete(null)
      await loadData()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể xóa phòng ban.'
      toast({
        title: 'Không thể xóa',
        description: msg || 'Lỗi xóa phòng ban',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1>Quản lý Phòng ban</h1>
          <p>Thiết lập danh mục cơ cấu phòng ban và phân bổ nhân sự doanh nghiệp</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Thêm phòng ban</span>
          </button>
        )}
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
          <div className="stat-card-title">Tổng số phòng ban</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-sub">Cơ cấu tổ chức hiện tại</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đang hoạt động</div>
          <div className="stat-card-value" style={{ color: '#059669' }}>{stats.active}</div>
          <div className="stat-card-sub">Khả dụng cho nhân sự</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Đã vô hiệu hóa</div>
          <div className="stat-card-value" style={{ color: stats.inactive > 0 ? '#d97706' : '#6b7280' }}>
            {stats.inactive}
          </div>
          <div className="stat-card-sub">Tạm ngưng sử dụng</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Tổng nhân sự trực thuộc</div>
          <div className="stat-card-value" style={{ color: '#2563eb' }}>{stats.totalUsers}</div>
          <div className="stat-card-sub">Nhân viên được gán phòng ban</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ flex: '1 1 250px' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input"
              placeholder="Tìm kiếm theo mã hoặc tên phòng ban..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              className="input"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã vô hiệu hóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Mã phòng ban</th>
                <th>Tên phòng ban</th>
                <th>Nhân sự</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                    Đang tải dữ liệu phòng ban...
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    Không tìm thấy phòng ban nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredDepartments.map(dept => (
                  <tr key={dept.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{dept.code}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} style={{ color: '#64748b' }} />
                        <span style={{ fontWeight: 500 }}>{dept.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} style={{ color: '#64748b' }} />
                        <span>{dept.userCount} người</span>
                      </div>
                    </td>
                    <td>
                      <span className={dept.isActive ? 'badge badge-green' : 'badge badge-gray'}>
                        {dept.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>
                      {formatDate(dept.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon"
                              title="Chỉnh sửa phòng ban"
                              onClick={() => handleOpenEdit(dept)}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon"
                              title={dept.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              style={{ color: dept.isActive ? '#d97706' : '#059669' }}
                              onClick={() => handleToggleStatus(dept)}
                            >
                              <Power size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon"
                              title="Xóa phòng ban"
                              style={{ color: '#ef4444' }}
                              onClick={() => setDeptToDelete(dept)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Phòng ban */}
      {openModal && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>{editingDept ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setOpenModal(false)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="dept-code">
                    Mã phòng ban <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="dept-code"
                    type="text"
                    className="input"
                    placeholder="VD: IT, HR, SALES, ACC..."
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Mã định danh duy nhất của phòng ban (viết tắt).
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="dept-name">
                    Tên phòng ban <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="dept-name"
                    type="text"
                    className="input"
                    placeholder="VD: Phòng Công nghệ thông tin..."
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={e => setFormActive(e.target.checked)}
                      disabled={submitting}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Kích hoạt phòng ban (cho phép gán nhân sự)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOpenModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : editingDept ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa */}
      {deptToDelete && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#dc2626' }}>Xác nhận xóa phòng ban</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setDeptToDelete(null)}
                disabled={deleting}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa phòng ban <strong>{deptToDelete.name} ({deptToDelete.code})</strong>?
              </p>
              {deptToDelete.userCount > 0 && (
                <div className="alert-warning" style={{ marginTop: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    Phòng ban này hiện có <strong>{deptToDelete.userCount} nhân sự</strong> trực thuộc. Bạn không thể xóa vật lý mà chỉ có thể vô hiệu hóa phòng ban.
                  </span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeptToDelete(null)}
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
