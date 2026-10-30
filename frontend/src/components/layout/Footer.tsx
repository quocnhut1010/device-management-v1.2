import { Building2, Shield, HeartHandshake, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Column 1 */}
        <div className="footer-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Building2 size={20} color="#2563eb" />
            <h4 style={{ margin: 0 }}>Device Manager</h4>
          </div>
          <p>
            Hệ thống quản lý vòng đời thiết bị, cấp phát và thu hồi chuẩn hóa cho doanh nghiệp.
          </p>
        </div>

        {/* Column 2 */}
        <div className="footer-col">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><Link to="/dashboard">Bảng điều khiển</Link></li>
            <li><Link to="/devices">Danh sách thiết bị</Link></li>
            <li><Link to="/assignments">Quản lý bàn giao</Link></li>
            <li><Link to="/users">Danh sách người dùng</Link></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="footer-col">
          <h4>Hỗ trợ kỹ thuật</h4>
          <ul>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} />
              <span>Bảo mật JWT Bearer</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HeartHandshake size={14} />
              <span>SLA Bàn giao & Phê duyệt</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} />
              <span>Kiến trúc Layered sạch</span>
            </li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="footer-col">
          <h4>Phiên bản v1.2</h4>
          <p style={{ marginBottom: '8px' }}>
            Nền tảng công nghệ: ASP.NET Core 7.0 Web API, React 19, TypeScript, Vite & SQL Server.
          </p>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            Trạng thái máy chủ: <span style={{ color: '#10b981', fontWeight: 600 }}>● Hoạt động</span>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        © {currentYear} Device Management System v1.2. Phát triển dựa trên quy chuẩn kiến trúc AGENTS.
      </div>
    </footer>
  )
}
