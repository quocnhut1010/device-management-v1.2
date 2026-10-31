import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { DevicesPage } from './pages/DevicesPage'
import { UsersPage } from './pages/UsersPage'
import { AssignmentsPage } from './pages/AssignmentsPage'
import { DeviceHistoryPage } from './pages/DeviceHistoryPage'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { DeviceCatalogPage } from './pages/DeviceCatalogPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { RepairsPage } from './pages/RepairsPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Đang tải hệ thống...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/device-history" element={<DeviceHistoryPage />} />
          <Route path="/device-categories" element={<DeviceCatalogPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />

          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/repairs" element={<RepairsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
