import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getStoredUser, getToken, getUserFromToken, login as loginRequest, logout as logoutRequest } from '../services/auth'
import type { JwtPayload, LoginResponse } from '../types'

type AuthContextValue = {
  token: string | null
  jwt: JwtPayload | null
  profile: LoginResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [jwt, setJwt] = useState<JwtPayload | null>(null)
  const [profile, setProfile] = useState<LoginResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = getToken()
    const decoded = getUserFromToken()
    const storedUser = getStoredUser()
    setToken(storedToken)
    setJwt(decoded)
    setProfile(storedUser)
    setIsLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    token,
    jwt,
    profile,
    isAuthenticated: !!token && !!jwt,
    isLoading,
    login: async (email: string, password: string) => {
      const user = await loginRequest(email, password)
      setToken(user.token)
      setJwt(getUserFromToken())
      setProfile(user)
    },
    logout: () => {
      logoutRequest()
      setToken(null)
      setJwt(null)
      setProfile(null)
    },
  }), [token, jwt, profile, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
