import { useEffect, useMemo, useState } from 'react'
import {
  Layers,
  Cpu,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  Package,
  AlertCircle,
  X,
  Filter,
} from 'lucide-react'
import {
  getDeviceTypes,
  createDeviceType,
  updateDeviceType,
  toggleDeviceTypeStatus,
  deleteDeviceType,
  getDeviceModels,
  createDeviceModel,
  updateDeviceModel,
  toggleDeviceModelStatus,
  deleteDeviceModel,
} from '../services/resources'
import type { DeviceModel, DeviceType } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/use-toast'
import { formatDate } from '../lib/dateUtils'

export function DeviceCatalogPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role?.toLowerCase() === 'admin'
  const { toast } = useToast()

  // Tabs: 'types' | 'models'
  const [activeTab, setActiveTab] = useState<'types' | 'models'>('types')

  // Data states
  const [types, setTypes] = useState<DeviceType[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Search & filter states
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedTypeId, setSelectedTypeId] = useState<string>('all')

  // Type modal
  const [openTypeModal, setOpenTypeModal] = useState(false)
  const [editingType, setEditingType] = useState<DeviceType | null>(null)
  const [typeCode, setTypeCode] = useState('')
  const [typeName, setTypeName] = useState('')
  const [typeDescription, setTypeDescription] = useState('')
  const [typeActive, setTypeActive] = useState(true)

  // Model modal
  const [openModelModal, setOpenModelModal] = useState(false)
  const [editingModel, setEditingModel] = useState<DeviceModel | null>(null)
  const [modelTypeId, setModelTypeId] = useState('')
  const [modelCode, setModelCode] = useState('')
  const [modelName, setModelName] = useState('')
  const [modelManufacturer, setModelManufacturer] = useState('')
  const [modelSpecs, setModelSpecs] = useState('')
  const [modelActive, setModelActive] = useState(true)

  const [submitting, setSubmitting] = useState(false)

  // Delete confirm dialogs
  const [itemToDelete, setItemToDelete] = useState<{
    kind: 'type' | 'model'
    id: string
    name: string
    code: string
    count: number
  } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    void loadAllData()
  }, [])

  async function loadAllData() {
    setLoading(true)
    setError('')
    try {
      const [typeList, modelList] = await Promise.all([
        getDeviceTypes(),
        getDeviceModels(),
      ])
      setTypes(typeList)
      setModels(modelList)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể tải dữ liệu danh mục thiết bị.'
      setError(msg || 'Lỗi tải danh mục')
    } finally {
      setLoading(false)
    }
  }

  // Active types for dropdown selection
  const activeTypes = useMemo(() => types.filter(t => t.isActive), [types])

  // Filtered Types
  const filteredTypes = useMemo(() => {
    return types.filter(t => {
      const matchesKeyword =
        !keyword ||
        t.code.toLowerCase().includes(keyword.toLowerCase()) ||
        t.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(keyword.toLowerCase()))

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && t.isActive) ||
        (statusFilter === 'inactive' && !t.isActive)

      return matchesKeyword && matchesStatus
    })
  }, [types, keyword, statusFilter])

  // Filtered Models
  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const matchesKeyword =
        !keyword ||
        m.code.toLowerCase().includes(keyword.toLowerCase()) ||
        m.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (m.manufacturer && m.manufacturer.toLowerCase().includes(keyword.toLowerCase()))

      const matchesType = selectedTypeId === 'all' || m.deviceTypeId === selectedTypeId

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && m.isActive) ||
        (statusFilter === 'inactive' && !m.isActive)

      return matchesKeyword && matchesType && matchesStatus
    })
  }, [models, keyword, selectedTypeId, statusFilter])

  // Stats for Types
  const typeStats = useMemo(() => {
    const total = types.length
    const active = types.filter(t => t.isActive).length
    const inactive = total - active
    const totalModels = types.reduce((acc, t) => acc + (t.modelCount || 0), 0)
    return { total, active, inactive, totalModels }
  }, [types])

  // Stats for Models
  const modelStats = useMemo(() => {
    const total = models.length
    const active = models.filter(m => m.isActive).length
    const inactive = total - active
    const totalDevices = models.reduce((acc, m) => acc + (m.deviceCount || 0), 0)
    return { total, active, inactive, totalDevices }
  }, [models])

  // Handlers for Device Type
  const handleOpenCreateType = () => {
    setEditingType(null)
    setTypeCode('')
    setTypeName('')
    setTypeDescription('')
    setTypeActive(true)
    setOpenTypeModal(true)
  }

  const handleOpenEditType = (type: DeviceType) => {
    setEditingType(type)
    setTypeCode(type.code)
    setTypeName(type.name)
    setTypeDescription(type.description || '')
    setTypeActive(type.isActive)
    setOpenTypeModal(true)
  }

  const handleSubmitType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!typeCode.trim() || !typeName.trim()) {
      toast({
        title: 'Lỗi nhập liệu',
        description: 'Vui lòng nhập mã và tên loại thiết bị.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      if (editingType) {
        await updateDeviceType(editingType.id, {
          code: typeCode.trim(),
          name: typeName.trim(),
          description: typeDescription.trim() || undefined,
          isActive: typeActive,
        })
        toast({
          title: 'Thành công',
          description: `Đã cập nhật loại thiết bị '${typeName}'.`,
        })
      } else {
        await createDeviceType({
          code: typeCode.trim().toUpperCase(),
          name: typeName.trim(),
          description: typeDescription.trim() || undefined,
          isActive: typeActive,
        })
        toast({
          title: 'Thành công',
          description: `Đã tạo loại thiết bị '${typeName}'.`,
        })
      }
      setOpenTypeModal(false)
      await loadAllData()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Lỗi lưu loại thiết bị.'
      toast({
        title: 'Thất bại',
        description: msg || 'Lỗi thao tác',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleTypeStatus = async (type: DeviceType) => {
    try {
      const updated = await toggleDeviceTypeStatus(type.id)
      toast({
        title: 'Cập nhật trạng thái',
        description: `Loại thiết bị '${type.name}' hiện đang ${updated.isActive ? 'hoạt động' : 'vô hiệu hóa'}.`,
      })
      await loadAllData()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể thay đổi trạng thái loại thiết bị.'
      toast({
        title: 'Thất bại',
        description: msg || 'Lỗi cập nhật',
        variant: 'destructive',
      })
    }
  }

  // Handlers for Device Model
  const handleOpenCreateModel = () => {
    setEditingModel(null)
    setModelTypeId(activeTypes.length > 0 ? activeTypes[0].id : '')
    setModelCode('')
    setModelName('')
    setModelManufacturer('')
    setModelSpecs('')
    setModelActive(true)
    setOpenModelModal(true)
  }

  const handleOpenEditModel = (model: DeviceModel) => {
    setEditingModel(model)
    setModelTypeId(model.deviceTypeId)
    setModelCode(model.code)
    setModelName(model.name)
    setModelManufacturer(model.manufacturer || '')
    setModelSpecs(model.specifications || '')
    setModelActive(model.isActive)
    setOpenModelModal(true)
  }

  const handleSubmitModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modelTypeId || !modelCode.trim() || !modelName.trim()) {
      toast({
        title: 'Lỗi nhập liệu',
        description: 'Vui lòng chọn loại thiết bị và nhập mã, tên dòng máy.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      if (editingModel) {
        await updateDeviceModel(editingModel.id, {
          deviceTypeId: modelTypeId,
          code: modelCode.trim(),
          name: modelName.trim(),
          manufacturer: modelManufacturer.trim() || undefined,
          specifications: modelSpecs.trim() || undefined,
          isActive: modelActive,
        })
        toast({
          title: 'Thành công',
          description: `Đã cập nhật dòng máy '${modelName}'.`,
        })
      } else {
        await createDeviceModel({
          deviceTypeId: modelTypeId,
          code: modelCode.trim().toUpperCase(),
          name: modelName.trim(),
          manufacturer: modelManufacturer.trim() || undefined,
          specifications: modelSpecs.trim() || undefined,
          isActive: modelActive,
        })
        toast({
          title: 'Thành công',
          description: `Đã tạo dòng máy '${modelName}'.`,
        })
      }
      setOpenModelModal(false)
      await loadAllData()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Lỗi lưu dòng máy.'
      toast({
        title: 'Thất bại',
        description: msg || 'Lỗi thao tác',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleModelStatus = async (model: DeviceModel) => {
    try {
      const updated = await toggleDeviceModelStatus(model.id)
      toast({
        title: 'Cập nhật trạng thái',
        description: `Dòng máy '${model.name}' hiện đang ${updated.isActive ? 'hoạt động' : 'vô hiệu hóa'}.`,
      })
      await loadAllData()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể thay đổi trạng thái dòng máy.'
      toast({
        title: 'Thất bại',
        description: msg || 'Lỗi cập nhật',
        variant: 'destructive',
      })
    }
  }

  // Delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setDeleting(true)
    try {
      if (itemToDelete.kind === 'type') {
        await deleteDeviceType(itemToDelete.id)
        toast({
          title: 'Thành công',
          description: `Đã xóa loại thiết bị '${itemToDelete.name}'.`,
        })
      } else {
        await deleteDeviceModel(itemToDelete.id)
        toast({
          title: 'Thành công',
          description: `Đã xóa dòng máy '${itemToDelete.name}'.`,
        })
      }
      setItemToDelete(null)
      await loadAllData()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Không thể thực hiện xóa.'
      toast({
        title: 'Không thể xóa',
        description: msg || 'Lỗi khi xóa',
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
          <h1>Loại & Model Thiết bị</h1>
          <p>Quản lý danh mục chủng loại và các dòng máy chuẩn hóa thay thế nhập tự do</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeTab === 'types' ? (
              <button type="button" className="btn btn-primary" onClick={handleOpenCreateType}>
                <Plus size={16} />
                <span>Thêm loại thiết bị</span>
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleOpenCreateModel}>
                <Plus size={16} />
                <span>Thêm dòng máy (Model)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'types' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('types')
            setKeyword('')
            setStatusFilter('all')
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Layers size={16} />
          <span>Loại thiết bị ({types.length})</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'models' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('models')
            setKeyword('')
            setStatusFilter('all')
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Cpu size={16} />
          <span>Dòng máy / Model ({models.length})</span>
        </button>
      </div>

      {/* TAB 1: DEVICE TYPES */}
      {activeTab === 'types' && (
        <>
          {/* Stats Cards for Types */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-title">Tổng số loại thiết bị</div>
              <div className="stat-card-value">{typeStats.total}</div>
              <div className="stat-card-sub">Chủng loại phân loại thiết bị</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Đang hoạt động</div>
              <div className="stat-card-value" style={{ color: '#059669' }}>{typeStats.active}</div>
              <div className="stat-card-sub">Sẵn sàng để gán thiết bị mới</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Đã vô hiệu hóa</div>
              <div className="stat-card-value" style={{ color: typeStats.inactive > 0 ? '#d97706' : '#6b7280' }}>
                {typeStats.inactive}
              </div>
              <div className="stat-card-sub">Không cho phép chọn mới</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Tổng số Model trực thuộc</div>
              <div className="stat-card-value" style={{ color: '#2563eb' }}>{typeStats.totalModels}</div>
              <div className="stat-card-sub">Các phiên bản dòng máy</div>
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
                  placeholder="Tìm theo mã hoặc tên loại thiết bị..."
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

          {/* Types Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã loại</th>
                    <th>Tên loại thiết bị</th>
                    <th>Mô tả</th>
                    <th>Số Model</th>
                    <th>Số thiết bị</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                        Đang tải danh mục loại thiết bị...
                      </td>
                    </tr>
                  ) : filteredTypes.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                        Không tìm thấy loại thiết bị nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredTypes.map(t => (
                      <tr key={t.id}>
                        <td>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{t.code}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={16} style={{ color: '#64748b' }} />
                            <span style={{ fontWeight: 500 }}>{t.name}</span>
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>
                          {t.description || '—'}
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{t.modelCount}</span> model
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{t.deviceCount}</span> thiết bị
                        </td>
                        <td>
                          <span className={t.isActive ? 'badge badge-green' : 'badge badge-gray'}>
                            {t.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-icon"
                                  title="Chỉnh sửa loại thiết bị"
                                  onClick={() => handleOpenEditType(t)}
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-icon"
                                  title={t.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                  style={{ color: t.isActive ? '#d97706' : '#059669' }}
                                  onClick={() => handleToggleTypeStatus(t)}
                                >
                                  <Power size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-icon"
                                  title="Xóa loại thiết bị"
                                  style={{ color: '#ef4444' }}
                                  onClick={() =>
                                    setItemToDelete({
                                      kind: 'type',
                                      id: t.id,
                                      name: t.name,
                                      code: t.code,
                                      count: t.modelCount + t.deviceCount,
                                    })
                                  }
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
        </>
      )}

      {/* TAB 2: DEVICE MODELS */}
      {activeTab === 'models' && (
        <>
          {/* Stats Cards for Models */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-title">Tổng số dòng máy (Model)</div>
              <div className="stat-card-value">{modelStats.total}</div>
              <div className="stat-card-sub">Dòng thiết bị catalog chuẩn</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Đang hoạt động</div>
              <div className="stat-card-value" style={{ color: '#059669' }}>{modelStats.active}</div>
              <div className="stat-card-sub">Sẵn sàng để chọn khi tạo máy</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Đã vô hiệu hóa</div>
              <div className="stat-card-value" style={{ color: modelStats.inactive > 0 ? '#d97706' : '#6b7280' }}>
                {modelStats.inactive}
              </div>
              <div className="stat-card-sub">Ngừng sản xuất hoặc không dùng</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Thiết bị liên kết</div>
              <div className="stat-card-value" style={{ color: '#2563eb' }}>{modelStats.totalDevices}</div>
              <div className="stat-card-sub">Tổng số thiết bị vật lý sử dụng</div>
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
                  placeholder="Tìm theo mã, tên model hoặc hãng sản xuất..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
              </div>

              <div style={{ width: '200px' }}>
                <select
                  className="input"
                  value={selectedTypeId}
                  onChange={e => setSelectedTypeId(e.target.value)}
                >
                  <option value="all">Tất cả loại thiết bị</option>
                  {types.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} {!t.isActive ? '(Đã tắt)' : ''}
                    </option>
                  ))}
                </select>
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

          {/* Models Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã model</th>
                    <th>Tên Model</th>
                    <th>Loại thiết bị</th>
                    <th>Hãng sản xuất</th>
                    <th>Thông số kỹ thuật</th>
                    <th>Số thiết bị</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                        Đang tải danh mục dòng máy...
                      </td>
                    </tr>
                  ) : filteredModels.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                        Không tìm thấy dòng máy nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredModels.map(m => (
                      <tr key={m.id}>
                        <td>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{m.code}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Cpu size={16} style={{ color: '#64748b' }} />
                            <span style={{ fontWeight: 500 }}>{m.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-blue">
                            {m.deviceTypeName || '—'}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#334155' }}>{m.manufacturer || '—'}</span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '13px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.specifications || ''}>
                          {m.specifications || '—'}
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{m.deviceCount}</span> máy
                        </td>
                        <td>
                          <span className={m.isActive ? 'badge badge-green' : 'badge badge-gray'}>
                            {m.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-icon"
                                  title="Chỉnh sửa dòng máy"
                                  onClick={() => handleOpenEditModel(m)}
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-icon"
                                  title={m.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                  style={{ color: m.isActive ? '#d97706' : '#059669' }}
                                  onClick={() => handleToggleModelStatus(m)}
                                >
                                  <Power size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-icon"
                                  title="Xóa dòng máy"
                                  style={{ color: '#ef4444' }}
                                  onClick={() =>
                                    setItemToDelete({
                                      kind: 'model',
                                      id: m.id,
                                      name: m.name,
                                      code: m.code,
                                      count: m.deviceCount,
                                    })
                                  }
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
        </>
      )}

      {/* Modal Thêm / Sửa Loại thiết bị */}
      {openTypeModal && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>{editingType ? 'Chỉnh sửa loại thiết bị' : 'Thêm loại thiết bị mới'}</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setOpenTypeModal(false)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitType}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="type-code">
                    Mã loại thiết bị <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="type-code"
                    type="text"
                    className="input"
                    placeholder="VD: DT-LAPTOP, DT-DESKTOP, DT-MONITOR..."
                    value={typeCode}
                    onChange={e => setTypeCode(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="type-name">
                    Tên loại thiết bị <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="type-name"
                    type="text"
                    className="input"
                    placeholder="VD: Laptop, Máy tính để bàn, Màn hình..."
                    value={typeName}
                    onChange={e => setTypeName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="type-desc">
                    Mô tả
                  </label>
                  <textarea
                    id="type-desc"
                    className="input"
                    rows={3}
                    placeholder="Mô tả chức năng hoặc mục đích sử dụng..."
                    value={typeDescription}
                    onChange={e => setTypeDescription(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={typeActive}
                      onChange={e => setTypeActive(e.target.checked)}
                      disabled={submitting}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Kích hoạt loại thiết bị (cho phép tạo model và thiết bị)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOpenTypeModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : editingType ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa Dòng máy (Model) */}
      {openModelModal && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{editingModel ? 'Chỉnh sửa dòng máy (Model)' : 'Thêm dòng máy mới'}</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setOpenModelModal(false)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitModel}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="model-type">
                    Thuộc loại thiết bị <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    id="model-type"
                    className="input"
                    value={modelTypeId}
                    onChange={e => setModelTypeId(e.target.value)}
                    required
                    disabled={submitting}
                  >
                    <option value="" disabled>-- Chọn loại thiết bị --</option>
                    {activeTypes.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="model-code">
                    Mã dòng máy <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="model-code"
                    type="text"
                    className="input"
                    placeholder="VD: DM-LATITUDE-5420, DM-T14-GEN3..."
                    value={modelCode}
                    onChange={e => setModelCode(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="model-name">
                    Tên dòng máy / Model <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="model-name"
                    type="text"
                    className="input"
                    placeholder="VD: Latitude 5420, ThinkPad T14, MacBook Pro 14..."
                    value={modelName}
                    onChange={e => setModelName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="model-mfg">
                    Hãng sản xuất
                  </label>
                  <input
                    id="model-mfg"
                    type="text"
                    className="input"
                    placeholder="VD: Dell, HP, Lenovo, Apple, Samsung..."
                    value={modelManufacturer}
                    onChange={e => setModelManufacturer(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="model-specs">
                    Thông số kỹ thuật chuẩn
                  </label>
                  <textarea
                    id="model-specs"
                    className="input"
                    rows={2}
                    placeholder="VD: CPU Core i5-1145G7, 16GB RAM, 512GB SSD..."
                    value={modelSpecs}
                    onChange={e => setModelSpecs(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={modelActive}
                      onChange={e => setModelActive(e.target.checked)}
                      disabled={submitting}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Kích hoạt dòng máy (cho phép chọn khi thêm thiết bị)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOpenModelModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : editingModel ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa */}
      {itemToDelete && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#dc2626' }}>
                Xác nhận xóa {itemToDelete.kind === 'type' ? 'loại thiết bị' : 'dòng máy'}
              </h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setItemToDelete(null)}
                disabled={deleting}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa {itemToDelete.kind === 'type' ? 'loại thiết bị' : 'dòng máy'}{' '}
                <strong>{itemToDelete.name} ({itemToDelete.code})</strong>?
              </p>
              {itemToDelete.count > 0 && (
                <div className="alert-warning" style={{ marginTop: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    Mục này hiện đang có <strong>{itemToDelete.count} bản ghi liên kết</strong> (dòng máy hoặc thiết bị). Hệ thống sẽ chặn xóa vật lý để bảo vệ toàn vẹn dữ liệu. Bạn nên vô hiệu hóa thay vì xóa.
                  </span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setItemToDelete(null)}
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
