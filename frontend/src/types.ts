export type ApiResponse<T> = {
  success: boolean
  message: string | null
  data: T
}

export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
}

export type LoginResponse = {
  token: string
  userId: string
  email: string
  role: string
  fullName: string
}

export type JwtPayload = {
  nameid: string
  email: string
  role: string
  exp: number
  iss?: string
  aud?: string
}

export type DeviceStatus = 1 | 2 | 3 | 4 | 5
export type UserStatus = 1 | 2
export type AssignmentStatus = 1 | 2 | 3 | 4 | 5

export interface Department {
  id: string
  code: string
  name: string
  isActive: boolean
  userCount: number
  createdAt: string
  updatedAt?: string | null
}

export interface CreateDepartmentInput {
  code: string
  name: string
  isActive?: boolean
}

export interface UpdateDepartmentInput {
  code: string
  name: string
  isActive: boolean
}

export interface DeviceType {
  id: string
  code: string
  name: string
  description?: string | null
  isActive: boolean
  modelCount: number
  deviceCount: number
  createdAt: string
  updatedAt?: string | null
}

export interface CreateDeviceTypeInput {
  code: string
  name: string
  description?: string | null
  isActive?: boolean
}

export interface UpdateDeviceTypeInput {
  code: string
  name: string
  description?: string | null
  isActive: boolean
}

export interface DeviceModel {
  id: string
  deviceTypeId: string
  deviceTypeName?: string | null
  code: string
  name: string
  manufacturer?: string | null
  specifications?: string | null
  isActive: boolean
  deviceCount: number
  createdAt: string
  updatedAt?: string | null
}

export interface CreateDeviceModelInput {
  deviceTypeId: string
  code: string
  name: string
  manufacturer?: string | null
  specifications?: string | null
  isActive?: boolean
}

export interface UpdateDeviceModelInput {
  deviceTypeId: string
  code: string
  name: string
  manufacturer?: string | null
  specifications?: string | null
  isActive: boolean
}

export type Device = {
  id: string
  code: string
  name: string
  serialNumber: string
  category?: string | null
  model?: string | null
  deviceTypeId?: string | null
  deviceTypeName?: string | null
  deviceModelId?: string | null
  deviceModelName?: string | null
  status: DeviceStatus
  purchasedDate?: string | null
  createdAt?: string
  updatedAt?: string | null
}

export type User = {
  id: string
  departmentId?: string | null
  departmentName?: string | null
  code: string
  fullName: string
  email: string
  phoneNumber?: string | null
  role?: string
  status: UserStatus
  createdAt?: string
  updatedAt?: string | null
}

export type UserDto = {
  id: string
  fullName: string
  email: string
  role?: string
  position?: string
  departmentName?: string
  departmentId?: string | null
  updatedAt?: string | null
  createdAt?: string
}

export type Assignment = {
  id: string
  deviceId: string
  userId: string
  status: AssignmentStatus
  assignedAt: string
}

export type DeviceFilter = {
  keyword?: string
  status?: string
  page: number
  pageSize: number
}

export type UserFilter = {
  keyword?: string
  status?: string
  page: number
  pageSize: number
}

export type AssignmentFilter = {
  deviceId?: string
  userId?: string
  status?: string
  page: number
  pageSize: number
}

export type DeviceHistory = {
  id: string
  deviceId: string
  action: string
  oldStatus: DeviceStatus | null
  newStatus: DeviceStatus | null
  description: string | null
  createdByUserId: string | null
  createdByUserName: string | null
  createdAt: string
  deviceName?: string | null
}

export type DashboardStats = {
  totalDevices: number
  availableDevices: number
  inUseDevices: number
  pendingDevices: number
  underRepairDevices: number
  disposedDevices: number
  totalUsers: number
  pendingAssignments: number
  myAssignments: number
}
