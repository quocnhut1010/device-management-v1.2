import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { DevicesPage } from './pages/DevicesPage'
import { UsersPage } from './pages/UsersPage'
import { AssignmentsPage } from './pages/AssignmentsPage'
import { DeviceHistoryPage } from './pages/DeviceHistoryPage'
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
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/users" element={<UsersPage />} />

          {/* Các module ứng viên tương lai theo Roadmap */}
          <Route
            path="/device-categories"
            element={
              <PlaceholderPage
                title="Loại & Model thiết bị"
                moduleName="Quản lý danh mục loại máy & Model"
              />
            }
          />
          <Route
            path="/incidents"
            element={
              <PlaceholderPage
                title="Báo cáo sự cố"
                moduleName="Quản lý sự cố kỹ thuật (Incidents)"
              />
            }
          />
          <Route
            path="/repairs"
            element={
              <PlaceholderPage
                title="Lệnh sửa chữa"
                moduleName="Quản lý sửa chữa & Bảo trì (Repairs)"
              />
            }
          />
          <Route
            path="/departments"
            element={
              <PlaceholderPage
                title="Quản lý Phòng ban"
                moduleName="Quản lý cơ cấu phòng ban"
              />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
