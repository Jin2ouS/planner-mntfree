import { useEffect, useState } from 'react'
import './TabNavigation.css'

function TabNavigation({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('')
  const tabs = [
    { id: 'calculator', label: '투자 목표 계산기', icon: '💰', targetId: 'investment-calculator' },
    { id: 'assets', label: '수입지출 점검하기', icon: '📊', targetId: 'asset-review' }
  ]

  const handleClick = (tab) => {
    const targetElement = document.getElementById(tab.targetId)
    if (targetElement) {
      const offset = 80 // 네비게이션 높이 고려
      const elementPosition = targetElement.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      setActiveSection(tab.id)
      if (onNavigate) {
        onNavigate(tab.id)
      }
    }
  }

  // 스크롤 위치에 따라 active 섹션 업데이트
  useEffect(() => {
    const handleScroll = () => {
      const sections = tabs.map(tab => ({
        id: tab.id,
        element: document.getElementById(tab.targetId)
      }))

      const scrollPosition = window.scrollY + 150

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.element) {
          const sectionTop = section.element.offsetTop
          if (scrollPosition >= sectionTop) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 초기 실행

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="tab-navigation">
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeSection === tab.id ? 'active' : ''}`}
            onClick={() => handleClick(tab)}
            aria-label={tab.label}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TabNavigation
