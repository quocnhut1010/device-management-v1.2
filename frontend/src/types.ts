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

export type Device = {
  id: string
  code: string
  name: string
  serialNumber: string
  category?: string | null
  model?: string | null
  status: DeviceStatus
  purchasedDate?: string | null
  createdAt?: string
  updatedAt?: string | null
}

export type User = {
  id: string
  departmentId?: string | null
  code: string
  fullName: string
  email: string
  phoneNumber?: string | null
  status: UserStatus
  createdAt?: string
  updatedAt?: string | null
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
