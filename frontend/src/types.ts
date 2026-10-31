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

export type IncidentSeverity = 1 | 2 | 3 | 4
export type IncidentStatus = 1 | 2 | 3 | 4 | 5 | 6

export type RepairStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type RepairPriority = 1 | 2 | 3 | 4

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

export interface Incident {
  id: string
  deviceId: string
  deviceCode?: string | null
  deviceName?: string | null
  reportedByUserId: string
  reportedByUserName?: string | null
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  resolutionNotes?: string | null
  reportedAt: string
  resolvedAt?: string | null
  createdAt: string
  hasRepairOrder: boolean
}

export interface CreateIncidentInput {
  deviceId: string
  title: string
  description: string
  severity?: IncidentSeverity
}

export interface UpdateIncidentStatusInput {
  status: IncidentStatus
  severity?: IncidentSeverity | null
  resolutionNotes?: string | null
}

export interface IncidentFilter {
  keyword?: string
  deviceId?: string
  reportedByUserId?: string
  status?: number
  severity?: number
  page: number
  pageSize: number
}

export interface RepairOrder {
  id: string
  code: string
  incidentId?: string | null
  incidentTitle?: string | null
  deviceId: string
  deviceCode?: string | null
  deviceName?: string | null
  assignedToUserId?: string | null
  assignedToUserName?: string | null
  status: RepairStatus
  priority: RepairPriority
  estimatedCost?: number | null
  actualCost?: number | null
  description: string
  resolutionNotes?: string | null
  startDate?: string | null
  completedDate?: string | null
  createdAt: string
}

export interface CreateRepairOrderInput {
  code?: string
  incidentId?: string | null
  deviceId: string
  assignedToUserId?: string | null
  priority?: RepairPriority
  estimatedCost?: number | null
  description: string
}

export interface AssignRepairOrderInput {
  assignedToUserId: string
}

export interface UpdateRepairOrderStatusInput {
  status: RepairStatus
  actualCost?: number | null
  resolutionNotes?: string | null
}

export interface RepairOrderFilter {
  keyword?: string
  deviceId?: string
  assignedToUserId?: string
  status?: number
  priority?: number
  page: number
  pageSize: number
}
