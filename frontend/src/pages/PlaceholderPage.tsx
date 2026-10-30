import { Clock, ArrowLeft, Package } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PlaceholderPageProps {
  title: string
  description?: string
  moduleName?: string
}

export function PlaceholderPage({ title, description, moduleName }: PlaceholderPageProps) {
  return (
    <div className="card placeholder-page">
      <div className="placeholder-icon">
        <Clock size={32} />
      </div>
      <span className="badge-dev" style={{ marginBottom: '12px' }}>
        Lộ trình tương lai
      </span>
      <h2>{title}</h2>
      <p>
        {description ||
          `Module ${moduleName || title} đang được hoàn thiện theo lộ trình (Roadmap) phát triển tiếp theo. Các chức năng cốt lõi hiện tại (Quản lý thiết bị, Người dùng và Quy trình bàn giao) đã sẵn sàng phục vụ.`}
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/dashboard" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Về Dashboard</span>
        </Link>
        <Link to="/devices" className="btn btn-primary">
          <Package size={16} />
          <span>Xem danh sách thiết bị</span>
        </Link>
      </div>
    </div>
  )
}
