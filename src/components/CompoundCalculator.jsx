import { useState, useEffect, useMemo, Fragment } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import './CompoundCalculator.css'

const RATE_ROW_CONFIG = [
  { id: 'annual', label: '연수익율' },
  { id: 'monthly', label: '월수익율' },
  { id: 'daily', label: '일수익율' },
]

const PERIOD_BUTTON_ROWS = [
  [{ months: 1 }, { months: 3 }, { months: 6 }, { months: 9 }],
  [{ years: 1 }, { years: 2 }, { years: 3 }, { years: 5 }],
  [{ years: 10 }, { years: 20 }, { years: 30 }],
]

const RESULT_UNITS = [
  { id: 'month', label: '월단위' },
  { id: 'day', label: '일단위' },
]

function CompoundCalculator() {
  const [annualRate, setAnnualRate] = useState('20')
  const [monthlyRate, setMonthlyRate] = useState('3')
  const [dailyRate, setDailyRate] = useState('0.5')
  const [rateUnit, setRateUnit] = useState('annual')
  const [periodYears, setPeriodYears] = useState(10)
  const [periodMonths, setPeriodMonths] = useState(0)
  const [periodDays, setPeriodDays] = useState(0)
  const [principal, setPrincipal] = useState(1000)
  const [resultUnit, setResultUnit] = useState('month')
  const [result, setResult] = useState(null)
  const [collapsedYears, setCollapsedYears] = useState(new Set())
  const [activeChartPoint, setActiveChartPoint] = useState(null)

  const periodInYears = useMemo(() => {
    return periodYears + periodMonths / 12 + periodDays / 365
  }, [periodYears, periodMonths, periodDays])

  const totalDays = useMemo(() => {
    return Math.round(periodYears * 365 + periodMonths * (365 / 12) + periodDays)
  }, [periodYears, periodMonths, periodDays])

  const activeRateValue = rateUnit === 'annual' ? annualRate : rateUnit === 'monthly' ? monthlyRate : dailyRate

  useEffect(() => {
    const val = Number(activeRateValue)
    if (!val || val <= 0 || periodInYears <= 0) {
      setResult(null)
      return
    }
    const r = val / 100
    let annRate
    if (rateUnit === 'annual') annRate = r
    else if (rateUnit === 'monthly') annRate = Math.pow(1 + r, 12) - 1
    else annRate = Math.pow(1 + r, 365) - 1

    const finalAmount = principal * Math.pow(1 + annRate, periodInYears)
    const totalReturn = finalAmount - principal
    const cagr = periodInYears > 0 ? (Math.pow(finalAmount / principal, 1 / periodInYears) - 1) * 100 : 0

    const computeAmount = (unitCount, isMonth) => {
      const t = isMonth ? unitCount / 12 : unitCount / 365
      return principal * Math.pow(1 + annRate, t)
    }

    const monthlyData = []
    const monthCount = Math.max(0, Math.ceil(periodInYears * 12))
    for (let m = 0; m <= monthCount; m++) {
      const y = Math.floor(m / 12)
      const mo = m % 12
      const label = m === 0 || (mo === 0 && m > 0) ? `${y}년차` : `${y}년차-${mo}개월차`
      monthlyData.push({
        index: m,
        label,
        amount: computeAmount(m, true),
      })
    }

    const dailyData = []
    const dayCount = Math.max(0, totalDays)
    for (let d = 0; d <= dayCount; d++) {
      dailyData.push({
        index: d,
        label: `${d}일차`,
        amount: computeAmount(d, false),
      })
    }

    setResult({
      finalAmount,
      totalReturn,
      cagr,
      monthlyData,
      dailyData,
    })
  }, [activeRateValue, rateUnit, periodInYears, principal, totalDays])

  const formatNumber = (n) => new Intl.NumberFormat('ko-KR').format(Math.round(n))

  const handlePeriodButton = (opt) => {
    if (opt.years !== undefined) {
      setPeriodYears(opt.years)
      setPeriodMonths(0)
      setPeriodDays(0)
    } else if (opt.months !== undefined) {
      setPeriodYears(0)
      setPeriodMonths(opt.months)
      setPeriodDays(0)
    }
  }

  const isButtonActive = (opt) => {
    if (opt.years !== undefined) return periodYears === opt.years && periodMonths === 0 && periodDays === 0
    if (opt.months !== undefined) return periodYears === 0 && periodMonths === opt.months && periodDays === 0
    return false
  }

  const handleReset = () => {
    setAnnualRate('20')
    setMonthlyRate('3')
    setDailyRate('0.5')
    setRateUnit('annual')
    setPeriodYears(10)
    setPeriodMonths(0)
    setPeriodDays(0)
    setPrincipal(1000)
    setResultUnit('month')
  }

  const handleScrollToResult = () => {
    const el = document.querySelector('#compound-calculator .calculator-result-panel')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const rawTableData = result ? (resultUnit === 'month' ? result.monthlyData : result.dailyData) : []
  const tableData = rawTableData

  const tableDataByYear = useMemo(() => {
    if (!tableData.length) return []
    const isMonth = resultUnit === 'month'
    const getYear = (idx) => (isMonth ? Math.floor(idx / 12) : Math.floor(idx / 365))
    const groups = []
    let currentYear = -1
    let currentGroup = null
    tableData.forEach((row) => {
      const y = getYear(row.index)
      if (y !== currentYear) {
        currentYear = y
        currentGroup = { year: y, boundaryRow: row, detailRows: [] }
        groups.push(currentGroup)
      } else if (currentGroup.boundaryRow.index !== row.index) {
        currentGroup.detailRows.push(row)
      }
    })
    return groups
  }, [tableData, resultUnit])

  useEffect(() => {
    if (tableDataByYear.length === 0) return
    const lastWithDetails = [...tableDataByYear].reverse().find((g) => g.detailRows.length > 0)
    const yearToExpand = lastWithDetails ? lastWithDetails.year : tableDataByYear[tableDataByYear.length - 1]?.year
    const yearsToCollapse = tableDataByYear.map((g) => g.year).filter((y) => y !== yearToExpand)
    setCollapsedYears(new Set(yearsToCollapse))
  }, [tableDataByYear])

  const toggleYear = (year) => {
    setCollapsedYears((prev) => {
      const next = new Set(prev)
      if (next.has(year)) next.delete(year)
      else next.add(year)
      return next
    })
  }

  const chartData = useMemo(() => {
    if (!result) return []
    const raw = resultUnit === 'month' ? result.monthlyData : result.dailyData
    if (raw.length <= 100) return raw
    const step = Math.ceil(raw.length / 100)
    return raw.filter((_, i) => i % step === 0 || i === raw.length - 1)
  }, [result, resultUnit])

  useEffect(() => {
    setActiveChartPoint(null)
  }, [chartData])

  return (
    <div id="compound-calculator" className="calculator-container compound">
      <header className="calculator-header">
        <h1>🔄 복리 투자 계산기</h1>
        <p className="subtitle">수익률과 기간을 입력하면 투자 결과를 확인할 수 있습니다</p>
      </header>

      <div className="calculator-content">
        <div className="calculator-input-panel">
          <h2 className="panel-title panel-title-input">✏️ 입력하기</h2>
          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>📈</span> 수익률</h2>
            <p className="rate-section-hint">3개 중 1개를 선택하여 사용합니다</p>
            <div className="rate-input-rows">
              {RATE_ROW_CONFIG.map((row) => {
                const isAnnual = row.id === 'annual'
                const isMonthly = row.id === 'monthly'
                const val = isAnnual ? annualRate : isMonthly ? monthlyRate : dailyRate
                const setVal = isAnnual ? setAnnualRate : isMonthly ? setMonthlyRate : setDailyRate
                const step = isAnnual ? 0.5 : isMonthly ? 0.05 : 0.01
                return (
                  <div
                    key={row.id}
                    className={`rate-input-row-item ${rateUnit === row.id ? 'selected' : ''}`}
                    onClick={() => setRateUnit(row.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRateUnit(row.id) } }}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="rate-row-label">{row.label}</span>
                    <div className="rate-row-input-wrap" onClick={(e) => e.stopPropagation()}>
                      <div className="input-wrapper input-wrapper-sm">
                        <input
                          type="number"
                          className="form-input"
                          value={val}
                          onChange={(e) => setVal(e.target.value)}
                          min="0"
                          step={step}
                          placeholder="0"
                        />
                        <div className="input-buttons">
                          <button type="button" className="input-btn input-btn-up" onClick={() => setVal(String(+(Number(val || 0) + step).toFixed(row.id === 'daily' ? 3 : 2)))} aria-label="증가">▲</button>
                          <button type="button" className="input-btn input-btn-down" onClick={() => setVal(String(Math.max(0, Number(val || 0) - step)))} aria-label="감소">▼</button>
                        </div>
                      </div>
                      <span className="input-suffix">%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>📅</span> 투자 기간</h2>
            <div className="period-input-rows">
              <div className="period-input-item">
                <span className="period-input-label">년단위</span>
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="form-input period-num"
                    value={periodYears ?? ''}
                    onChange={(e) => setPeriodYears(Math.max(0, Number(e.target.value) || 0))}
                    min="0"
                    placeholder="0"
                  />
                  <div className="input-buttons">
                    <button type="button" className="input-btn input-btn-up" onClick={() => setPeriodYears((v) => Math.max(0, (v || 0) + 1))} aria-label="증가">▲</button>
                    <button type="button" className="input-btn input-btn-down" onClick={() => setPeriodYears((v) => Math.max(0, (v || 0) - 1))} aria-label="감소">▼</button>
                  </div>
                </div>
                <span className="period-input-suffix">개년</span>
              </div>
              <div className="period-input-item">
                <span className="period-input-label">월단위</span>
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="form-input period-num"
                    value={periodMonths ?? ''}
                    onChange={(e) => setPeriodMonths(Math.max(0, Number(e.target.value) || 0))}
                    min="0"
                    placeholder="0"
                  />
                  <div className="input-buttons">
                    <button type="button" className="input-btn input-btn-up" onClick={() => setPeriodMonths((v) => Math.max(0, (v || 0) + 1))} aria-label="증가">▲</button>
                    <button type="button" className="input-btn input-btn-down" onClick={() => setPeriodMonths((v) => Math.max(0, (v || 0) - 1))} aria-label="감소">▼</button>
                  </div>
                </div>
                <span className="period-input-suffix">개월</span>
              </div>
              <div className="period-input-item">
                <span className="period-input-label">일단위</span>
                <div className="input-wrapper">
                  <input
                    type="number"
                    className="form-input period-num"
                    value={periodDays ?? ''}
                    onChange={(e) => setPeriodDays(Math.max(0, Number(e.target.value) || 0))}
                    min="0"
                    placeholder="0"
                  />
                  <div className="input-buttons">
                    <button type="button" className="input-btn input-btn-up" onClick={() => setPeriodDays((v) => Math.max(0, (v || 0) + 1))} aria-label="증가">▲</button>
                    <button type="button" className="input-btn input-btn-down" onClick={() => setPeriodDays((v) => Math.max(0, (v || 0) - 1))} aria-label="감소">▼</button>
                  </div>
                </div>
                <span className="period-input-suffix">일</span>
              </div>
            </div>
            <div className="period-buttons-grid">
              {PERIOD_BUTTON_ROWS.map((row, rowIdx) => (
                <div key={rowIdx} className="period-buttons-row">
                  {row.map((opt, idx) => {
                    const label = opt.years ? `${opt.years}년` : `${opt.months}개월`
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`period-btn ${isButtonActive(opt) ? 'active' : ''}`}
                        onClick={() => handlePeriodButton(opt)}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </section>

          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>💰</span> 투자 원금 (만원)</h2>
            <div className="rate-input-row">
              <div className="input-wrapper">
                <input
                  type="number"
                  className="form-input"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
                  min="0"
                />
                <div className="input-buttons">
                  <button type="button" className="input-btn input-btn-up" onClick={() => setPrincipal((v) => Math.max(0, (v || 0) + 100))} aria-label="100만원 증가">▲</button>
                  <button type="button" className="input-btn input-btn-down" onClick={() => setPrincipal((v) => Math.max(0, (v || 0) - 100))} aria-label="100만원 감소">▼</button>
                </div>
              </div>
              <span className="input-suffix">만원</span>
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

        <div className="calculator-result-panel">
          <h2 className="panel-title panel-title-result">📊 결과보기</h2>
          <section className="result-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>📋</span> 투자 결과</h2>
            {result ? (
              <>
                <div className="result-cards">
                  <div className="result-card">
                    <div className="result-label">최종 자산</div>
                    <div className="result-value primary">{formatNumber(result.finalAmount)}만원</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">총 수익</div>
                    <div className="result-value">{formatNumber(result.totalReturn)}만원</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">연환산 수익률</div>
                    <div className="result-value">{result.cagr.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="result-unit-selector">
                  <span className="result-unit-label">결과 표시 단위</span>
                  <div className="result-unit-buttons">
                    {RESULT_UNITS.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className={`unit-btn ${resultUnit === u.id ? 'active' : ''}`}
                        onClick={() => setResultUnit(u.id)}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                {chartData.length > 0 && (
                  <div className="compound-chart-wrap">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10 }}
                          interval="preserveStartEnd"
                          tickFormatter={(v, i) => {
                            const total = chartData.length
                            if (total > 20) {
                              if (i === 0) return chartData[0].label
                              if (i === total - 1) return chartData[total - 1].label
                              if (i % Math.ceil(total / 5) === 0) return v
                            }
                            return v
                          }}
                        />
                        <YAxis
                          tickFormatter={(v) => `${new Intl.NumberFormat('ko-KR').format(Math.round(v))}만`}
                          tick={{ fontSize: 10 }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          formatter={(value) => [formatNumber(value) + '만원', '자산']}
                          labelFormatter={(label) => label}
                          contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb' }}
                        />
                        {chartData.length > 0 && (() => {
                          const last = chartData[chartData.length - 1]
                          return (
                            <>
                              <ReferenceLine
                                x={last.label}
                                stroke="#667eea"
                                strokeDasharray="5 5"
                                strokeOpacity={0.8}
                              />
                              <ReferenceLine
                                y={last.amount}
                                stroke="#667eea"
                                strokeDasharray="5 5"
                                strokeOpacity={0.8}
                              />
                            </>
                          )
                        })()}
                        {activeChartPoint && (
                          <>
                            <ReferenceLine
                              x={activeChartPoint.label}
                              stroke="#764ba2"
                              strokeDasharray="5 5"
                              strokeOpacity={0.6}
                            />
                            <ReferenceLine
                              y={activeChartPoint.amount}
                              stroke="#764ba2"
                              strokeDasharray="5 5"
                              strokeOpacity={0.6}
                            />
                          </>
                        )}
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#667eea"
                          strokeWidth={2}
                          dot={({ cx, cy, payload }) => (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill="#667eea"
                              style={{ cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (payload?.label != null && payload?.amount != null) {
                                  setActiveChartPoint((prev) =>
                                    prev?.label === payload.label ? null : { label: payload.label, amount: payload.amount }
                                  )
                                }
                              }}
                            />
                          )}
                          activeDot={{ r: 5, fill: '#667eea', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="yearly-table-wrap">
                  <table className="yearly-table">
                    <thead>
                      <tr>
                        <th>기간</th>
                        <th>자산 (만원)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableDataByYear.map((group) => {
                        const hasDetails = group.detailRows.length > 0
                        const isCollapsed = hasDetails && collapsedYears.has(group.year)
                        return (
                          <Fragment key={group.year}>
                            <tr
                              className={`year-boundary ${hasDetails ? 'year-boundary-expandable' : ''}`}
                              {...(hasDetails && {
                                onClick: () => toggleYear(group.year),
                                role: 'button',
                                tabIndex: 0,
                                onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleYear(group.year) } },
                              })}
                            >
                              <td>
                                {hasDetails && <span className="year-toggle">{isCollapsed ? '▶' : '▼'}</span>}
                                <span className="year-label">{group.boundaryRow.label}</span>
                              </td>
                              <td>{formatNumber(group.boundaryRow.amount)}</td>
                            </tr>
                            {hasDetails && !isCollapsed && group.detailRows.map((row) => (
                              <tr key={row.index}>
                                <td>{row.label}</td>
                                <td>{formatNumber(row.amount)}</td>
                              </tr>
                            ))}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="result-placeholder">수익률과 기간을 입력하세요.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default CompoundCalculator
