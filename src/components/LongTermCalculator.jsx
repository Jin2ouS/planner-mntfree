import { useState, useRef, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import {
  getMinYear,
  getMaxYear,
  getIndexOptions,
  getReturn,
  getReturnsInRange,
  simulate,
  getSourceInfo,
  getYearlyPrices,
  getValueLabel
} from '../data/indexReturns'
import './LongTermCalculator.css'

const PURCHASE_METHODS = [
  { id: 'lump', label: '일괄매수' },
  { id: 'dca', label: '분할매수' },
]

const PERIOD_QUICK_YEARS = [3, 5, 10, 20, 30]

function LongTermCalculator() {
  const minYear = getMinYear()
  const maxYear = getMaxYear()
  const indexOptions = getIndexOptions()

  const [startYear, setStartYear] = useState(maxYear - 10)
  const [endYear, setEndYear] = useState(maxYear)
  const [indexId, setIndexId] = useState('sp500')
  const [purchaseMethod, setPurchaseMethod] = useState('lump')
  const [initialAmount, setInitialAmount] = useState(1000)
  const [annualAmount, setAnnualAmount] = useState(120)
  const [calculated, setCalculated] = useState(false)

  const startYearClamped = Math.min(maxYear, Math.max(minYear, startYear))
  const endYearClamped = Math.min(maxYear, Math.max(minYear, endYear))
  const actualStart = Math.min(startYearClamped, endYearClamped)
  const actualEnd = Math.max(startYearClamped, endYearClamped)
  const yearsCount = actualEnd - actualStart + 1

  const tableReturns = getReturnsInRange(indexId, minYear, maxYear).filter(
    (r) => r.returnPct !== null
  )
  const returnByYear = Object.fromEntries(tableReturns.map((r) => [r.year, r.returnPct]))
  const minYearWithData = tableReturns.length > 0 ? tableReturns[0].year : minYear
  const maxYearWithData = tableReturns.length > 0 ? tableReturns[tableReturns.length - 1].year : maxYear
  const firstBlockStart = Math.ceil(minYearWithData / 5) * 5 - 4
  const yearBlocks = []
  for (let start = firstBlockStart; start <= maxYearWithData; start += 5) {
    const end = Math.min(start + 4, maxYearWithData)
    yearBlocks.push({ start, end })
  }

  const handleStartYearChange = (e) => {
    const v = Number(e.target.value)
    setStartYear(v)
    if (v > endYearClamped) setEndYear(v)
  }
  const handleEndYearChange = (e) => {
    const v = Number(e.target.value)
    setEndYear(v)
    if (v < startYearClamped) setStartYear(v)
  }

  const trackRef = useRef(null)
  const [trackDragging, setTrackDragging] = useState(false)
  const [thumbDragging, setThumbDragging] = useState(null)
  const dragStartRef = useRef({ startYear: 0, endYear: 0, clientX: 0 })

  const yearRange = maxYear - minYear + 1
  const startPct = ((actualStart - minYear) / yearRange) * 100
  const endPct = ((actualEnd - minYear) / yearRange) * 100

  const pxToYear = (clientX) => {
    if (!trackRef.current) return minYear
    const rect = trackRef.current.getBoundingClientRect()
    const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(minYear + t * (maxYear - minYear))
  }

  const handleTrackMouseDown = (e) => {
    e.preventDefault()
    dragStartRef.current = {
      startYear: actualStart,
      endYear: actualEnd,
      clientX: e.clientX
    }
    setTrackDragging(true)
  }

  const handleThumbMouseDown = (which, e) => {
    e.preventDefault()
    e.stopPropagation()
    setThumbDragging(which)
    dragStartRef.current = { clientX: e.clientX, startYear: actualStart, endYear: actualEnd }
  }

  useEffect(() => {
    if (!trackDragging || !trackRef.current) return
    const trackEl = trackRef.current

    const onMove = (e) => {
      const { startYear: s0, endYear: e0, clientX: x0 } = dragStartRef.current
      const duration = e0 - s0
      const w = trackEl.offsetWidth
      if (!w) return
      const deltaX = e.clientX - x0
      const deltaYears = Math.round((deltaX / w) * yearRange)
      const newStart = Math.max(minYear, Math.min(maxYear - duration, s0 + deltaYears))
      const newEnd = newStart + duration
      setStartYear(newStart)
      setEndYear(newEnd)
    }
    const onUp = () => setTrackDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [trackDragging, minYear, maxYear, yearRange])

  useEffect(() => {
    if (thumbDragging === null || !trackRef.current) return
    const onMove = (e) => {
      const y = pxToYear(e.clientX)
      if (thumbDragging === 'start') {
        const newStart = Math.max(minYear, Math.min(y, actualEnd))
        setStartYear(newStart)
      } else {
        const newEnd = Math.max(actualStart, Math.min(maxYear, y))
        setEndYear(newEnd)
      }
    }
    const onUp = () => setThumbDragging(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [thumbDragging, minYear, maxYear, actualStart, actualEnd])

  const handleCalculate = () => setCalculated(true)

  const handleReset = () => {
    setStartYear(maxYear - 10)
    setEndYear(maxYear)
    setIndexId('sp500')
    setPurchaseMethod('lump')
    setInitialAmount(1000)
    setAnnualAmount(120)
    setCalculated(false)
  }

  const simResult =
    calculated && yearsCount > 0
      ? simulate(
          indexId,
          actualStart,
          actualEnd,
          purchaseMethod,
          initialAmount,
          purchaseMethod === 'dca' ? annualAmount : 0
        )
      : null

  const firstDataYearInRange =
    calculated && yearsCount > 0
      ? (() => {
          for (let y = actualStart; y <= actualEnd; y++) {
            if (getReturn(indexId, y) != null) return y
          }
          return null
        })()
      : null

  const chartData = simResult
    ? simResult.yearlyData.map((d) => {
        const hasData = firstDataYearInRange != null && d.year >= firstDataYearInRange
        return {
          year: d.year,
          value: hasData ? Math.round(d.value * 10) / 10 : null,
          returnPct: d.returnPct
        }
      })
    : []

  const yearlyTableData =
    calculated && yearsCount > 0
      ? getYearlyPrices(indexId, actualStart, actualEnd).map((row) => ({
          ...row,
          startPrice: Math.round(row.startPrice * 100) / 100,
          endPrice: Math.round(row.endPrice * 100) / 100
        }))
      : []

  const valueLabel = getValueLabel(indexId)
  const formatNumber = (n) => new Intl.NumberFormat('ko-KR').format(Math.round(n))
  const formatDecimal = (n) => new Intl.NumberFormat('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  const formatValue = (v) => (v >= 100 ? formatNumber(v) : formatDecimal(v))

  const indexLabel = indexOptions.find((o) => o.id === indexId)?.label ?? indexId

  return (
    <div id="longterm-calculator" className="calculator-container longterm">
      <header className="calculator-header">
        <h1>📈 장기투자 계산기</h1>
        <p className="subtitle">투자 기간과 투자 대상을 선택해 수익률·MDD를 확인하세요</p>
      </header>

      <div className="calculator-content">
        <div className="calculator-input-panel">
          <h2 className="panel-title panel-title-input">✏️ 입력하기</h2>
          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>📊</span> 투자 대상</h2>
            <div className="index-options">
              <div className="index-options-row">
                {indexOptions.slice(0, 3).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`index-btn ${indexId === opt.id ? 'active' : ''}`}
                    onClick={() => setIndexId(opt.id)}
                  >
                    <span className="index-btn-en">{opt.labelEn}</span>
                    <span className="index-btn-ko">{opt.labelKo}</span>
                  </button>
                ))}
              </div>
              <div className="index-options-row">
                {indexOptions.slice(3, 5).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`index-btn ${indexId === opt.id ? 'active' : ''}`}
                    onClick={() => setIndexId(opt.id)}
                  >
                    <span className="index-btn-en">{opt.labelEn}</span>
                    <span className="index-btn-ko">{opt.labelKo}</span>
                  </button>
                ))}
              </div>
              <div className="index-options-row">
                {indexOptions.slice(5, 7).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`index-btn ${indexId === opt.id ? 'active' : ''}`}
                    onClick={() => setIndexId(opt.id)}
                  >
                    <span className="index-btn-en">{opt.labelEn}</span>
                    <span className="index-btn-ko">{opt.labelKo}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>📅</span> 투자 기간</h2>
            <p className="range-hint">좌단=시작, 우단=종료 · 몸통 드래그 시 기간 유지, 구간만 이동</p>
            <div className="range-dual-wrap" ref={trackRef}>
              <div className="range-track" aria-hidden="true" />
              <div
                className="range-fill"
                style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                aria-hidden="true"
              />
              <div
                className="range-body-drag"
                style={{
                  left: `${startPct + 2}%`,
                  width: `${Math.max(0, endPct - startPct - 4)}%`
                }}
                onMouseDown={handleTrackMouseDown}
                role="slider"
                aria-label="조회 기간 구간 이동"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
                  e.preventDefault()
                  const delta = e.key === 'ArrowRight' ? 1 : -1
                  const duration = actualEnd - actualStart
                  const newStart = Math.max(minYear, Math.min(maxYear - duration, actualStart + delta))
                  setStartYear(newStart)
                  setEndYear(newStart + duration)
                }}
              />
              <div
                className="range-thumb range-thumb-start"
                style={{ left: `${startPct}%` }}
                onMouseDown={(e) => handleThumbMouseDown('start', e)}
                role="slider"
                aria-valuemin={minYear}
                aria-valuemax={maxYear}
                aria-valuenow={actualStart}
                aria-label="시작 시점"
                tabIndex={0}
              />
              <div
                className="range-thumb range-thumb-end"
                style={{ left: `${endPct}%` }}
                onMouseDown={(e) => handleThumbMouseDown('end', e)}
                role="slider"
                aria-valuemin={minYear}
                aria-valuemax={maxYear}
                aria-valuenow={actualEnd}
                aria-label="종료 시점"
                tabIndex={0}
              />
            </div>
            <div className="year-select-row">
              <div className="year-select-cell">
                <label className="input-label">시작 시점 (년)</label>
                <select
                  className="year-select"
                  value={startYearClamped}
                  onChange={handleStartYearChange}
                >
                  {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)
                    .reverse()
                    .map((y) => (
                      <option key={y} value={y}>
                        {y}년
                      </option>
                    ))}
                </select>
              </div>
              <div className="year-select-cell">
                <label className="input-label">종료 시점 (년)</label>
                <select
                  className="year-select"
                  value={endYearClamped}
                  onChange={handleEndYearChange}
                >
                  {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)
                    .reverse()
                    .map((y) => (
                      <option key={y} value={y}>
                        {y}년
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="period-quick-buttons">
              {PERIOD_QUICK_YEARS.map((years) => (
                <button
                  key={years}
                  type="button"
                  className={`period-btn ${yearsCount === years ? 'active' : ''}`}
                  onClick={() => {
                    const newStart = Math.max(minYear, endYearClamped - years)
                    setStartYear(newStart)
                  }}
                >
                  {years}년
                </button>
              ))}
            </div>
            <div className="duration-display">
              실제 기간: {yearsCount}년
            </div>
          </section>

          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>🛒</span> 매수 방법</h2>
            <div className="purchase-options">
              {PURCHASE_METHODS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`purchase-btn ${purchaseMethod === opt.id ? 'active' : ''}`}
                  onClick={() => setPurchaseMethod(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="amount-input-group">
              <label className="input-label">최초 매수금액 (만원)</label>
              <input
                type="number"
                className="amount-input"
                min={0}
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="amount-input-group">
              <label className="input-label">년간 매수금액 (만원)</label>
              <input
                type="number"
                className="amount-input"
                min={0}
                value={annualAmount}
                onChange={(e) => setAnnualAmount(Number(e.target.value) || 0)}
                disabled={purchaseMethod === 'lump'}
                aria-disabled={purchaseMethod === 'lump'}
              />
            </div>
          </section>

          <div className="calc-btn-group">
            <button type="button" className="btn btn-primary" onClick={handleCalculate}>
              계산하기
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              초기화
            </button>
          </div>
        </div>

        <div className="calculator-result-panel">
          <h2 className="panel-title panel-title-result">📊 결과보기</h2>
          {calculated ? (
            <>
              <div className="result-block-card">
                <h3 className="result-block-label"><span className="section-icon" aria-hidden>📋</span> 요약</h3>
                <div className="result-cards">
                  <div className="result-card">
                    <div className="result-label">기간 수익률</div>
                    <div className="result-value primary">
                      {simResult?.totalReturnPct != null
                        ? `${simResult.totalReturnPct >= 0 ? '+' : ''}${simResult.totalReturnPct.toFixed(1)}%`
                        : '-'}
                    </div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">CAGR (연환산)</div>
                    <div className="result-value">
                      {simResult?.cagr != null ? `${simResult.cagr.toFixed(1)}%` : '-'}
                    </div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">MDD (최대 낙폭)</div>
                    <div className="result-value negative">
                      {simResult?.mdd != null ? `-${simResult.mdd.toFixed(1)}%` : '-'}
                    </div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">최종 평가액</div>
                    <div className="result-value">
                      {simResult?.endValue != null ? `${formatNumber(simResult.endValue)}만원` : '-'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="result-block-card index-chart-wrap">
                <h3 className="result-block-label"><span className="section-icon" aria-hidden>📈</span> 기간별 평가액 추이 (만원)</h3>
                  {firstDataYearInRange != null && firstDataYearInRange > actualStart && (
                    <p className="chart-data-note">
                      선·점은 해당 투자 대상 데이터가 있는 <strong>{firstDataYearInRange}년</strong>부터 표시됩니다.
                    </p>
                  )}
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                        tickFormatter={(v) => formatNumber(v)}
                      />
                      <Tooltip
                        formatter={(v) => [formatNumber(v), '평가액(만원)']}
                        labelFormatter={(y) => `${y}년`}
                      />
                      <ReferenceLine
                        y={initialAmount}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#667eea"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
              </div>

                {simResult?.yearlyData?.length > 0 && (
                  <div className="result-block-card period-detail-section">
                    <h3 className="result-block-label"><span className="section-icon" aria-hidden>📊</span> 연차별 투자결과</h3>
                    <div className="period-detail-table-wrap">
                      <table className="period-detail-table">
                        <thead>
                          <tr>
                            <th>년도</th>
                            <th>수익률(%)</th>
                            <th>평가액(만원)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {simResult.yearlyData.map((d) => (
                            <tr key={d.year}>
                              <td>{d.year}</td>
                              <td className={d.returnPct != null ? (d.returnPct >= 0 ? 'positive' : 'negative') : ''}>
                                {d.returnPct != null
                                  ? `${d.returnPct >= 0 ? '+' : ''}${d.returnPct.toFixed(1)}%`
                                  : '-'}
                              </td>
                              <td>{d.value != null ? formatNumber(d.value) : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {yearlyTableData.length > 0 && (
                  <div className="result-block-card yearly-data-section">
                    <h3 className="result-block-label"><span className="section-icon" aria-hidden>📉</span> 투자기간 가격변동 : {indexLabel}</h3>
                    {(() => {
                      const src = getSourceInfo(indexId)
                      return src ? <p className="yearly-data-ticker">티커: {src.ticker}</p> : null
                    })()}
                    <div className="yearly-data-table-wrap">
                      <table className="yearly-data-table">
                        <thead>
                          <tr>
                            <th>년도</th>
                            <th>시작값</th>
                            <th>종료값</th>
                            <th>상승율</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yearlyTableData.map((row) => (
                            <tr key={row.year}>
                              <td>{row.year}</td>
                              <td>{formatValue(row.startPrice)}</td>
                              <td>{formatValue(row.endPrice)}</td>
                              <td className={row.returnPct >= 0 ? 'positive' : 'negative'}>
                                {row.returnPct >= 0 ? '+' : ''}{row.returnPct.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="result-block-card result-block-card-spaced returns-table-wrap">
                  <h3 className="result-block-label">
                    <span className="section-icon" aria-hidden>📉</span> 전체 기간 가격변동 : {indexLabel}
                    {(() => {
                      const src = getSourceInfo(indexId)
                      return src ? `, ${src.ticker}` : ''
                    })()}
                  </h3>
                  <div className="returns-table-scroll">
                    {yearBlocks.length === 0 ? (
                      <p className="returns-no-data">데이터 없음</p>
                    ) : (
                      yearBlocks.map(({ start, end }) => {
                        const yearsInBlock = []
                        for (let y = start; y <= end; y++) yearsInBlock.push(y)
                        const firstDataYearInBlock = yearsInBlock.find((y) => returnByYear[y] != null)
                        const dataNote =
                          firstDataYearInBlock != null && firstDataYearInBlock > start
                            ? `(데이터는 ${firstDataYearInBlock}년부터)`
                            : null
                        return (
                          <div key={`${start}-${end}`} className="returns-block">
                            <div className="returns-block-header">
                              <span className="returns-block-icon">◆</span>
                              {start} ~ {end}
                              {dataNote != null && (
                                <span className="returns-block-note">{dataNote}</span>
                              )}
                            </div>
                            <table className="returns-block-table">
                              <tbody>
                                <tr className="returns-block-row returns-block-row-year">
                                  <th className="returns-block-th">연도</th>
                                  {yearsInBlock.map((y) => (
                                    <td key={y} className="returns-block-td">
                                      {String(y).slice(-2)}
                                    </td>
                                  ))}
                                </tr>
                                <tr className="returns-block-row returns-block-row-pct">
                                  <th className="returns-block-th">%</th>
                                  {yearsInBlock.map((y) => {
                                    const pct = returnByYear[y]
                                    return (
                                      <td
                                        key={y}
                                        className={`returns-block-td ${pct != null ? (pct >= 0 ? 'positive' : 'negative') : ''}`}
                                      >
                                        {pct != null
                                          ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}`
                                          : '-'}
                                      </td>
                                    )
                                  })}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                <p className="result-note">
                  * 위 수치는 선택한 투자 대상의 실제 연도별 수익률을 반영한 시뮬레이션 결과입니다.
                  <br />
                  데이터 출처: 야후 파이낸스 (Yahoo Finance){' '}
                  {(() => {
                    const src = getSourceInfo(indexId)
                    if (!src) return null
                    return (
                      <>
                        티커 <code>{src.ticker}</code>{' '}
                        <a href={src.url} target="_blank" rel="noopener noreferrer">
                          {src.url}
                        </a>
                      </>
                    )
                  })()}
                </p>
              </>
            ) : (
              <div className="result-block-card">
                <p className="result-placeholder">
                  좌측에서 조건을 선택한 뒤 「계산하기」를 눌러주세요.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default LongTermCalculator
