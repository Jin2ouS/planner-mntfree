import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '../config/navConfig'
import './Hero.css'

function Hero() {
  const title = '투자 계산기'
  const subtitle = 'Above and Beyond'
  const description = '당신의 재무 목표를 달성하기 위한 정확한 투자 수익률을 계산하세요.\n데이터 기반의 스마트한 투자 계획을 시작하세요.'

  return (
    <div className="hero-container">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            <span className="hero-title-main">{title}</span>
            <span className="hero-title-sub">{subtitle}</span>
          </h1>
          <p className="hero-description">
            {description.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < description.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
          <div className="hero-quick-links">
            {NAV_ITEMS.filter((item) => item.path !== '/').map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="hero-quick-link"
              >
                <span className="quick-link-icon">{item.icon}</span>
                <span className="quick-link-text">
                  <span className="quick-link-label">{item.label}</span>
                  <span className="quick-link-arrow">→ 바로 가기</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <iframe
            src="https://my.spline.design/animatedpaperboat-7itTG95TRAI6qRw0WKRfHn8l/"
            frameBorder="0"
            width="100%"
            height="100%"
            title="3D Animation"
            allow="autoplay"
            style={{ pointerEvents: 'auto' }}
          />
        </div>
      </div>
    </div>
  )
}

export default Hero
