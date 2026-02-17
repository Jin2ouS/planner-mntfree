import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import './AssetReview.css'

function AssetReview() {
  const [assets, setAssets] = useState({
    cash: 0,
    stocks: 0,
    realEstate: 0,
    bonds: 0,
    other: 0
  })

  const [income, setIncome] = useState({
    salary: 0,
    assetIncome: 0,
    other: 0
  })

  const [expenses, setExpenses] = useState({
    housing: 0,
    food: 0,
    transport: 0,
    communication: 0,
    insurance: 0,
    other: 0
  })

  const clampNumber = (value) => {
    const num = Number(value)
    if (!Number.isFinite(num)) return 0
    return Math.max(0, num)
  }

  const handleAssetChange = (category, value) => {
    setAssets(prev => ({
      ...prev,
      [category]: clampNumber(value)
    }))
  }

  const handleIncomeChange = (category, value) => {
    setIncome(prev => ({
      ...prev,
      [category]: clampNumber(value)
    }))
  }

  const handleExpenseChange = (category, value) => {
    setExpenses(prev => ({
      ...prev,
      [category]: clampNumber(value)
    }))
  }

  const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num)

  const STEP_AMOUNT_MANWON = 10
  const adjustAsset = (category, delta) => {
    setAssets(prev => ({
      ...prev,
      [category]: Math.max(0, (prev[category] || 0) + delta * STEP_AMOUNT_MANWON)
    }))
  }

  const adjustIncome = (category, delta) => {
    setIncome(prev => ({
      ...prev,
      [category]: Math.max(0, (prev[category] || 0) + delta * STEP_AMOUNT_MANWON)
    }))
  }

  const adjustExpense = (category, delta) => {
    setExpenses(prev => ({
      ...prev,
      [category]: Math.max(0, (prev[category] || 0) + delta * STEP_AMOUNT_MANWON)
    }))
  }

  const handleReset = () => {
    setAssets({ cash: 0, stocks: 0, realEstate: 0, bonds: 0, other: 0 })
    setIncome({ salary: 0, assetIncome: 0, other: 0 })
    setExpenses({ housing: 0, food: 0, transport: 0, communication: 0, insurance: 0, other: 0 })
  }

  const handleScrollToResult = () => {
    const el = document.querySelector('.asset-review-results')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 자산 합계 계산
  const totalAssets = Object.values(assets).reduce((sum, val) => {
    return sum + (val || 0)
  }, 0)

  // 수입 합계 계산
  const totalIncome = Object.values(income).reduce((sum, val) => {
    return sum + (val || 0)
  }, 0)

  // 월 수입 계산
  const monthlyIncome = totalIncome

  // 지출 합계 계산
  const totalExpenses = Object.values(expenses).reduce((sum, val) => {
    return sum + (val || 0)
  }, 0)

  // 월 지출 계산
  const monthlyExpenses = totalExpenses

  // 자산 카테고리별 비율 계산
  const assetCategories = [
    { key: 'realEstate', label: '부동산', value: assets.realEstate },
    { key: 'stocks', label: '주식', value: assets.stocks },
    { key: 'bonds', label: '예적금,펀드', value: assets.bonds },
    { key: 'cash', label: '현금성 자산', value: assets.cash },
    { key: 'other', label: '기타', value: assets.other }
  ].filter(item => (item.value || 0) > 0)

  // 지출 카테고리별 비율 계산
  const expenseCategories = [
    { key: 'housing', label: '주거비', value: expenses.housing },
    { key: 'communication', label: '통신비', value: expenses.communication },
    { key: 'transport', label: '교통비', value: expenses.transport },
    { key: 'food', label: '식비', value: expenses.food },
    { key: 'insurance', label: '보험', value: expenses.insurance },
    { key: 'other', label: '기타', value: expenses.other }
  ].filter(item => (item.value || 0) > 0)

  // 수입 카테고리별 비율 계산
  const incomeCategories = [
    { key: 'salary', label: '근로소득', value: income.salary },
    { key: 'assetIncome', label: '자산소득', value: income.assetIncome },
    { key: 'other', label: '기타', value: income.other }
  ].filter(item => (item.value || 0) > 0)

  const assetPieData = assetCategories.map((c) => ({ name: c.label, value: c.value || 0 }))
  const expensePieData = expenseCategories.map((c) => ({ name: c.label, value: c.value || 0 }))
  const incomePieData = incomeCategories.map((c) => ({ name: c.label, value: c.value || 0 }))

  const PIE_COLORS = ['#667eea', '#764ba2', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#94a3b8']

  const formatManwon = (value) => `${formatNumber(value)}만원`

  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const item = payload[0]
    return (
      <div className="pie-tooltip">
        <div className="pie-tooltip-title">{item.name}</div>
        <div className="pie-tooltip-value">{formatManwon(item.value)}</div>
      </div>
    )
  }

  return (
    <div id="asset-review" className="asset-review-container">
      <header className="asset-review-header">
        <h1>📊 수입지출 점검하기</h1>
        <p className="subtitle">나의 자산과 수입·지출을 입력하고 분석해보세요</p>
      </header>

      <div className="asset-review-content calculator-content">
        <div className="calculator-input-panel asset-review-inputs">
          <h2 className="panel-title panel-title-input">✏️ 입력하기</h2>
          {/* 고정지출 입력 섹션 */}
          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>💸</span> 고정지출</h2>
            <div className="input-grid">
            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">🏠</span>
                  <span className="label-text">주거비</span>
                  <span className="label-description">월세, 전세자금, 관리비 등 주거 관련 비용</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={expenses.housing}
                  onChange={(e) => handleExpenseChange('housing', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustExpense('housing', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustExpense('housing', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">📱</span>
                  <span className="label-text">통신비</span>
                  <span className="label-description">휴대폰 요금, 인터넷, TV 요금 등</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={expenses.communication}
                  onChange={(e) => handleExpenseChange('communication', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustExpense('communication', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustExpense('communication', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">🚗</span>
                  <span className="label-text">교통비</span>
                  <span className="label-description">대중교통비, 주유비, 주차비 등</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={expenses.transport}
                  onChange={(e) => handleExpenseChange('transport', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustExpense('transport', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustExpense('transport', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">🍽️</span>
                  <span className="label-text">식비</span>
                  <span className="label-description">식료품, 외식비 등 식생활 관련 비용</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={expenses.food}
                  onChange={(e) => handleExpenseChange('food', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustExpense('food', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustExpense('food', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">🛡️</span>
                  <span className="label-text">보험</span>
                  <span className="label-description">생명보험, 건강보험, 자동차보험 등</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={expenses.insurance}
                  onChange={(e) => handleExpenseChange('insurance', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustExpense('insurance', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustExpense('insurance', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">📋</span>
                  <span className="label-text">기타</span>
                  <span className="label-description">교육비, 의료비, 취미 등 기타 고정 지출</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={expenses.other}
                  onChange={(e) => handleExpenseChange('other', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustExpense('other', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustExpense('other', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>
            </div>

            <div className="total-display">
              <span className="total-label">월 총 지출</span>
            <span className="total-value">{formatNumber(monthlyExpenses)}만원</span>
            </div>
          </section>

          {/* 고정수입 입력 섹션 */}
          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>💰</span> 고정수입</h2>
            <div className="input-grid">
            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">💼</span>
                  <span className="label-text">근로소득</span>
                  <span className="label-description">월 급여, 상여금 등 근로를 통한 소득</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={income.salary}
                  onChange={(e) => handleIncomeChange('salary', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustIncome('salary', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustIncome('salary', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">💰</span>
                  <span className="label-text">자산소득</span>
                  <span className="label-description">배당금, 이자, 임대료 등 자산에서 발생하는 소득</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={income.assetIncome}
                  onChange={(e) => handleIncomeChange('assetIncome', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustIncome('assetIncome', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustIncome('assetIncome', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">📋</span>
                  <span className="label-text">기타</span>
                  <span className="label-description">사업소득, 기타 소득 등</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={income.other}
                  onChange={(e) => handleIncomeChange('other', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustIncome('other', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustIncome('other', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>
            </div>

            <div className="total-display">
              <span className="total-label">월 총 수입</span>
            <span className="total-value">{formatNumber(monthlyIncome)}만원</span>
            </div>
          </section>

          {/* 보유자산 입력 섹션 */}
          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>🏠</span> 보유자산</h2>
            <div className="input-grid">
            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">🏘️</span>
                  <span className="label-text">부동산</span>
                  <span className="label-description">아파트, 오피스텔, 토지 등 부동산 자산</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={assets.realEstate}
                  onChange={(e) => handleAssetChange('realEstate', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustAsset('realEstate', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustAsset('realEstate', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">📈</span>
                  <span className="label-text">주식</span>
                  <span className="label-description">개별 주식 및 주식형 펀드 투자금</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={assets.stocks}
                  onChange={(e) => handleAssetChange('stocks', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustAsset('stocks', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustAsset('stocks', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">🏦</span>
                  <span className="label-text">예적금,펀드</span>
                  <span className="label-description">예금, 적금, 채권형 펀드 등 안정적 자산</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={assets.bonds}
                  onChange={(e) => handleAssetChange('bonds', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustAsset('bonds', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustAsset('bonds', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">💵</span>
                  <span className="label-text">현금성 자산</span>
                  <span className="label-description">현금, 당좌예금, MMDA 등 즉시 사용 가능한 자산</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={assets.cash}
                  onChange={(e) => handleAssetChange('cash', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustAsset('cash', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustAsset('cash', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>

            <div className="asset-input-group">
                <label className="input-label">
                  <span className="label-icon">📋</span>
                  <span className="label-text">기타</span>
                  <span className="label-description">기타 투자 자산 (암호화폐, 원자재 등)</span>
                </label>
              <div className="asset-input-row">
                <div className="asset-input-wrapper">
                  <input
                  type="number"
                  className="asset-form-input"
                    placeholder="0"
                  value={assets.other}
                  onChange={(e) => handleAssetChange('other', e.target.value)}
                  min="0"
                  />
                  <div className="asset-input-buttons">
                    <button type="button" className="asset-input-btn asset-input-btn-up" aria-label="증가" onClick={() => adjustAsset('other', 1)}>▲</button>
                    <button type="button" className="asset-input-btn asset-input-btn-down" aria-label="감소" onClick={() => adjustAsset('other', -1)}>▼</button>
                  </div>
                </div>
                <span className="asset-input-suffix">만원</span>
                </div>
              </div>
            </div>

            <div className="total-display">
              <span className="total-label">총 자산</span>
            <span className="total-value">{formatNumber(totalAssets)}만원</span>
            </div>
          </section>

          <div className="calc-btn-group">
            <button type="button" className="btn btn-primary" onClick={handleScrollToResult}>
              계산하기
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              초기화
            </button>
          </div>
        </div>

        <div className="calculator-result-panel asset-review-results">
          <h2 className="panel-title panel-title-result">📊 결과보기</h2>
          {(totalAssets > 0 || totalExpenses > 0 || totalIncome > 0) ? (
            <section className="analysis-section">
              <h2 className="section-title"><span className="section-icon" aria-hidden>📈</span> 분석 결과</h2>
              
              {totalExpenses > 0 && (
                <div className="analysis-card">
                  <h3 className="analysis-title">지출 구성</h3>
                  <div className="pie-layout">
                    <div className="pie-chart">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={expensePieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                            {expensePieData.map((_, idx) => (
                              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="pie-legend">
                      {expenseCategories.map((category, idx) => {
                        const value = category.value || 0
                        const percentage = ((value / totalExpenses) * 100).toFixed(1)
                        return (
                          <div key={category.key} className="pie-legend-row">
                            <span className="pie-dot" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="pie-name">{category.label}</span>
                            <span className="pie-percent">{percentage}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {totalIncome > 0 && (
                <div className="analysis-card">
                  <h3 className="analysis-title">수입 구성</h3>
                  <div className="pie-layout">
                    <div className="pie-chart">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={incomePieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                            {incomePieData.map((_, idx) => (
                              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="pie-legend">
                      {incomeCategories.map((category, idx) => {
                        const value = category.value || 0
                        const percentage = ((value / totalIncome) * 100).toFixed(1)
                        return (
                          <div key={category.key} className="pie-legend-row">
                            <span className="pie-dot" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="pie-name">{category.label}</span>
                            <span className="pie-percent">{percentage}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {totalAssets > 0 && (
                <div className="analysis-card">
                  <h3 className="analysis-title">자산 구성</h3>
                  <div className="pie-layout">
                    <div className="pie-chart">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={assetPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                            {assetPieData.map((_, idx) => (
                              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="pie-legend">
                      {assetCategories.map((category, idx) => {
                        const value = category.value || 0
                        const percentage = ((value / totalAssets) * 100).toFixed(1)
                        return (
                          <div key={category.key} className="pie-legend-row">
                            <span className="pie-dot" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="pie-name">{category.label}</span>
                            <span className="pie-percent">{percentage}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {totalAssets > 0 && totalExpenses > 0 && (() => {
                // 자산의 연 4% 기준
                const annualAsset4Percent = totalAssets * 0.04
                // 연 지출 (월 지출 * 12)
                const annualExpenses = monthlyExpenses * 12
                // 연 수입 (월 수입 * 12)
                const annualIncome = monthlyIncome * 12
                // 허용 가능한 연 지출 = 자산의 연 4% + 연 수입
                const allowedAnnualExpenses = annualAsset4Percent + annualIncome
                // 기준 대비 비율 (지출 / 허용 지출 * 100)
                const ratio = allowedAnnualExpenses > 0 ? (annualExpenses / allowedAnnualExpenses) * 100 : 0
                // 상태 판단 (100% 이상이면 안좋음, 미만이면 양호)
                const isGood = ratio < 100
                const statusText = isGood ? '양호' : '주의 필요'
                const statusClass = isGood ? 'status-good' : 'status-warning'
                
                return (
                  <div className="analysis-card highlight">
                    <h3 className="analysis-title">자산 대비 지출 비율</h3>
                    <div className="ratio-display">
                      <div className="ratio-status">
                        <span className={`status-badge ${statusClass}`}>{statusText}</span>
                      </div>
                      <div className="ratio-value">
                        {ratio.toFixed(1)}%
                      </div>
                      <div className="ratio-description">
                        연간 지출이 허용 기준 대비 <strong>{ratio.toFixed(1)}%</strong>입니다.
                        <br />
                        {isGood ? (
                          <span className="status-message good">지출이 적정 수준으로 관리되고 있습니다.</span>
                        ) : (
                          <span className="status-message warning">지출이 기준을 초과하여 자산 관리에 주의가 필요합니다.</span>
                        )}
                      </div>
                      <div className="ratio-reference">
                        <small>
                          허용 기준: 자산의 연 4% ({formatNumber(annualAsset4Percent)}만원/년) + 연 수입 ({formatNumber(annualIncome)}만원/년) = {formatNumber(allowedAnnualExpenses)}만원/년
                        </small>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </section>
          ) : (
            <div className="empty-results">
              <div className="empty-results-content">
                <div className="empty-icon">📊</div>
                <h3>분석 결과가 여기에 표시됩니다</h3>
                <p>좌측에서 자산과 지출 정보를 입력하시면<br />실시간으로 분석 결과를 확인할 수 있습니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssetReview
