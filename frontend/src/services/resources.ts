import type { ApiResponse, Assignment, AssignmentFilter, DashboardStats, Device, DeviceFilter, DeviceHistory, PagedResult, User, UserFilter } from '../types'
import api from './api'

function compactQuery(params: Record<string, string | number | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats')
  return response.data.data
}

export async function getDevices(filter: DeviceFilter) {
  const response = await api.get<ApiResponse<PagedResult<Device>>>('/devices', {
    params: compactQuery(filter),
  })
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
}) {
  const response = await api.post<ApiResponse<Device>>('/devices', payload)
  return response.data.data
}

export async function deleteDevice(id: string) {
  await api.delete(`/devices/${id}`)
}

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
}) {
  const response = await api.post<ApiResponse<User>>('/users', payload)
  return response.data.data
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`)
}

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
