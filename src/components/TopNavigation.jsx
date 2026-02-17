import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../config/navConfig'
import './TopNavigation.css'

function TopNavigation() {
  const location = useLocation()

  return (
    <nav className="top-navigation">
      <Link to="/" className="top-nav-logo">
        투자 계산기
      </Link>
      <div className="top-nav-menu">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`top-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="top-nav-icon">{item.icon}</span>
            <span className="top-nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default TopNavigation
