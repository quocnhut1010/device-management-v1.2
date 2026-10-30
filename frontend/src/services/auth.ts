import { jwtDecode } from 'jwt-decode'
import api from './api'
import type { ApiResponse, JwtPayload, LoginResponse } from '../types'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export async function login(email: string, password: string) {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password })
  const payload = response.data.data
  localStorage.setItem(TOKEN_KEY, payload.token)
  localStorage.setItem(USER_KEY, JSON.stringify(payload))
  return payload
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as LoginResponse) : null
}

export function getUserFromToken() {
  const token = getToken()
  if (!token) return null

  try {
    return jwtDecode<JwtPayload>(token)
  } catch {
    return null
  }
}
