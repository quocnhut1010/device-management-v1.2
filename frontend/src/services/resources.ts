import type {
  ApiResponse,
  Assignment,
  AssignmentFilter,
  DashboardStats,
  Department,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  Device,
  DeviceFilter,
  DeviceHistory,
  DeviceModel,
  CreateDeviceModelInput,
  UpdateDeviceModelInput,
  DeviceType,
  CreateDeviceTypeInput,
  UpdateDeviceTypeInput,
  PagedResult,
  User,
  UserFilter,
} from '../types'
import api from './api'

function compactQuery(params: Record<string, string | number | boolean | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  )
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats')
  return response.data.data
}

// ----------------- DEPARTMENTS -----------------
export async function getDepartments(params?: { keyword?: string; isActive?: boolean }): Promise<Department[]> {
  const response = await api.get<ApiResponse<Department[]>>('/departments', {
    params: params ? compactQuery(params) : undefined,
  })
  return response.data.data
}

export async function createDepartment(payload: CreateDepartmentInput): Promise<Department> {
  const response = await api.post<ApiResponse<Department>>('/departments', payload)
  return response.data.data
}

export async function updateDepartment(id: string, payload: UpdateDepartmentInput): Promise<Department> {
  const response = await api.put<ApiResponse<Department>>(`/departments/${id}`, payload)
  return response.data.data
}

export async function toggleDepartmentStatus(id: string): Promise<Department> {
  const response = await api.put<ApiResponse<Department>>(`/departments/${id}/toggle-status`)
  return response.data.data
}

export async function deleteDepartment(id: string): Promise<void> {
  await api.delete(`/departments/${id}`)
}

// ----------------- DEVICE TYPES -----------------
export async function getDeviceTypes(params?: { keyword?: string; isActive?: boolean }): Promise<DeviceType[]> {
  const response = await api.get<ApiResponse<DeviceType[]>>('/device-types', {
    params: params ? compactQuery(params) : undefined,
  })
  return response.data.data
}

export async function createDeviceType(payload: CreateDeviceTypeInput): Promise<DeviceType> {
  const response = await api.post<ApiResponse<DeviceType>>('/device-types', payload)
  return response.data.data
}

export async function updateDeviceType(id: string, payload: UpdateDeviceTypeInput): Promise<DeviceType> {
  const response = await api.put<ApiResponse<DeviceType>>(`/device-types/${id}`, payload)
  return response.data.data
}

export async function toggleDeviceTypeStatus(id: string): Promise<DeviceType> {
  const response = await api.put<ApiResponse<DeviceType>>(`/device-types/${id}/toggle-status`)
  return response.data.data
}

export async function deleteDeviceType(id: string): Promise<void> {
  await api.delete(`/device-types/${id}`)
}

// ----------------- DEVICE MODELS -----------------
export async function getDeviceModels(params?: {
  deviceTypeId?: string
  keyword?: string
  isActive?: boolean
}): Promise<DeviceModel[]> {
  const response = await api.get<ApiResponse<DeviceModel[]>>('/device-models', {
    params: params ? compactQuery(params) : undefined,
  })
  return response.data.data
}

export async function createDeviceModel(payload: CreateDeviceModelInput): Promise<DeviceModel> {
  const response = await api.post<ApiResponse<DeviceModel>>('/device-models', payload)
  return response.data.data
}

export async function updateDeviceModel(id: string, payload: UpdateDeviceModelInput): Promise<DeviceModel> {
  const response = await api.put<ApiResponse<DeviceModel>>(`/device-models/${id}`, payload)
  return response.data.data
}

export async function toggleDeviceModelStatus(id: string): Promise<DeviceModel> {
  const response = await api.put<ApiResponse<DeviceModel>>(`/device-models/${id}/toggle-status`)
  return response.data.data
}

export async function deleteDeviceModel(id: string): Promise<void> {
  await api.delete(`/device-models/${id}`)
}

// ----------------- DEVICES -----------------
export async function getDevices(filter: DeviceFilter) {
  const response = await api.get<ApiResponse<PagedResult<Device>>>('/devices', {
    params: compactQuery(filter),
  })
  return response.data.data
}

export async function getDeviceById(id: string): Promise<Device> {
  const response = await api.get<ApiResponse<Device>>(`/devices/${id}`)
  return response.data.data
}

export async function getDeviceHistory(
  deviceId: string,
  params?: { page?: number; pageSize?: number }
): Promise<PagedResult<DeviceHistory>> {
  const response = await api.get<ApiResponse<PagedResult<DeviceHistory>>>(`/devices/${deviceId}/history`, {
    params: params ? compactQuery(params) : undefined,
  })
  return response.data.data
}

export async function getAllDeviceHistories(params?: {
  deviceId?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<DeviceHistory>> {
  const response = await api.get<ApiResponse<PagedResult<DeviceHistory>>>('/devices/history', {
    params: params ? compactQuery(params) : undefined,
  })
  return response.data.data
}

export async function createDevice(payload: {
  code: string
  name: string
  serialNumber: string
  category?: string
  model?: string
  purchasedDate?: string | null
  deviceTypeId?: string | null
  deviceModelId?: string | null
}) {
  const response = await api.post<ApiResponse<Device>>('/devices', payload)
  return response.data.data
}

export async function updateDevice(
  id: string,
  payload: {
    name: string
    category?: string
    model?: string
    purchasedDate?: string | null
    deviceTypeId?: string | null
    deviceModelId?: string | null
  }
) {
  const response = await api.put<ApiResponse<Device>>(`/devices/${id}`, payload)
  return response.data.data
}

export async function deleteDevice(id: string) {
  await api.delete(`/devices/${id}`)
}

// ----------------- USERS -----------------
export async function getUsers(filter: UserFilter) {
  const response = await api.get<ApiResponse<PagedResult<User>>>('/users', {
    params: compactQuery(filter),
  })
  return response.data.data
}

export async function createUser(payload: {
  code: string
  fullName: string
  email: string
  phoneNumber?: string
  departmentId?: string | null
}) {
  const response = await api.post<ApiResponse<User>>('/users', payload)
  return response.data.data
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`)
}

// ----------------- ASSIGNMENTS -----------------
export async function getAssignments(filter: AssignmentFilter) {
  const response = await api.get<ApiResponse<PagedResult<Assignment>>>('/device-assignments', {
    params: compactQuery(filter),
  })
  return response.data.data
}

export async function createAssignment(payload: {
  deviceId: string
  userId: string
  assignedByUserId: string
  note?: string
}) {
  const response = await api.post<ApiResponse<Assignment>>('/device-assignments', payload)
  return response.data.data
}

export async function acceptAssignment(id: string) {
  const response = await api.post<ApiResponse<Assignment>>(`/device-assignments/${id}/accept`)
  return response.data.data
}

export async function rejectAssignment(id: string) {
  const response = await api.post<ApiResponse<Assignment>>(`/device-assignments/${id}/reject`)
  return response.data.data
}

export async function returnAssignment(id: string) {
  const response = await api.post<ApiResponse<Assignment>>(`/device-assignments/${id}/return`)
  return response.data.data
}

export async function revokeAssignment(id: string) {
  const response = await api.post<ApiResponse<Assignment>>(`/device-assignments/${id}/revoke`)
  return response.data.data
}
