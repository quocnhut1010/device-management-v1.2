import { Outlet } from 'react-router-dom'
import { Sidebar } from './layout/Sidebar'
import { TopNav } from './layout/TopNav'
import { Footer } from './layout/Footer'

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <TopNav />
        <main className="page-container">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
