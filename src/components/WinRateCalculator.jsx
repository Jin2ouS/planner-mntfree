import { useState, useEffect, useMemo } from 'react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Legend } from 'recharts'
import './WinRateCalculator.css'

// MDD(%) → 원금 복구 필요 수익률(%) 참고 도표용 데이터
const MDD_RECOVERY_TABLE = [5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90].map((mdd) => {
  const recoveryNum = mdd === 0 ? 0 : (1 / (1 - mdd / 100) - 1) * 100
  const recovery = recoveryNum.toFixed(1)
  const ratio = mdd === 0 ? '-' : (recoveryNum / mdd).toFixed(1)
  const ratioNum = mdd === 0 ? 0 : recoveryNum / mdd
  return { mdd, balance: 100 - mdd, recovery, ratio, recoveryNum, ratioNum }
})

function WinRateCalculator() {
  const [winRate, setWinRate] = useState(50)
  const [riskReward, setRiskReward] = useState(2)
  const [trades, setTrades] = useState(20)
  const [riskPerTrade, setRiskPerTrade] = useState(1)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const wr = Number(winRate) / 100
    const rr = Number(riskReward)
    const n = Number(trades) || 1
    const rpt = Math.min(0.99, Math.max(0.001, Number(riskPerTrade) / 100))

    const winTrades = wr * n
    const loseTrades = n - winTrades
    const avgReturnPerTrade = wr * rr - (1 - wr) * 1
    const totalReturnPct = avgReturnPerTrade * n * rpt
    const expectancy = avgReturnPerTrade * rpt * 100

    // 연속 손실 시 잔액 = (1-rpt)^n. 잔액이 초기 대비 약 1% 이하가 되는 n (실질 청산)
    const ruinCount =
      rpt >= 1 ? 1 : Math.ceil(Math.log(0.01) / Math.log(1 - rpt))

    setResult({
      winTrades: Math.round(winTrades * 10) / 10,
      loseTrades: Math.round(loseTrades * 10) / 10,
      expectancy: expectancy.toFixed(1),
      totalReturnPct: totalReturnPct.toFixed(1),
      ruinCount,
      riskPerTradePct: Number(riskPerTrade),
    })
  }, [winRate, riskReward, trades, riskPerTrade])

  const handleReset = () => {
    setWinRate(50)
    setRiskReward(2)
    setTrades(20)
    setRiskPerTrade(1)
  }

  const handleScrollToResult = () => {
    const el = document.querySelector('#winrate-calculator .calculator-result-panel')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 거래 횟수에 따른 수익률 차트: 승률에 따라 이기고 지는 패턴을 반복 (예: 70% → 7승 3패 반복)
  const returnChartData = useMemo(() => {
    const maxTrades = Math.max(Number(trades) || 1, 1)
    const wr = Number(winRate) / 100
    const rr = Number(riskReward)
    const rpt = Number(riskPerTrade) // 원금 대비 %
    if (maxTrades < 1 || rpt <= 0) return []

    const BLOCK = 10
    const winsInBlock = Math.round(BLOCK * wr)
    const lossesInBlock = BLOCK - winsInBlock
    const points = [{ trades: 0, returnPct: 0 }]
    let cum = 0

    for (let i = 0; i < maxTrades; i++) {
      const posInBlock = i % BLOCK
      const isWin = posInBlock < winsInBlock
      if (isWin) cum += rr * rpt
      else cum -= rpt
      points.push({ trades: i + 1, returnPct: Math.round(cum * 10) / 10 })
    }
    return points
  }, [winRate, riskReward, riskPerTrade, trades])

  // 청산 차트: 연속 손실 횟수에 따른 잔고율 (0 ~ ruinCount)
  const ruinChartData = useMemo(() => {
    if (!result?.ruinCount) return []
    const rpt = Math.min(0.99, Math.max(0.001, Number(riskPerTrade) / 100))
    const maxN = result.ruinCount
    const maxPoints = 80
    const step = Math.max(1, Math.floor(maxN / maxPoints))
    const points = []
    for (let n = 0; n <= maxN; n += step) {
      const balance = (1 - rpt) ** n * 100
      points.push({ lossCount: n, balance: Math.max(0, Math.round(balance * 10) / 10) })
    }
    if (points[points.length - 1]?.lossCount < maxN) {
      const balance = (1 - rpt) ** maxN * 100
      points.push({ lossCount: maxN, balance: Math.max(0, Math.round(balance * 10) / 10) })
    }
    return points
  }, [result?.ruinCount, riskPerTrade])

  return (
    <div id="winrate-calculator" className="calculator-container winrate">
      <header className="calculator-header">
        <h1>🎯 승률 손익비 계산기</h1>
        <p className="subtitle">승률·손익비와 1회당 수익률, 거래 횟수별 최종 예상 수익률·청산 위험을 확인하세요</p>
      </header>

      <div className="calculator-content">
        <div className="calculator-input-panel">
          <h2 className="panel-title panel-title-input">✏️ 입력하기</h2>
          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>🎯</span> 승률 (%)</h2>
            <div className="input-row">
              <input
                type="number"
                className="form-input"
                value={winRate}
                onChange={(e) => setWinRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                min="0"
                max="100"
              />
              <span className="input-suffix">%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={winRate}
              onChange={(e) => setWinRate(Number(e.target.value))}
              className="range-input"
            />
          </section>

          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>⚖️</span> 손익비 (승리 시 수익 / 패배 시 손실)</h2>
            <div className="input-row">
              <input
                type="number"
                className="form-input"
                value={riskReward}
                onChange={(e) => setRiskReward(Math.max(0.1, Number(e.target.value) || 0))}
                min="0.1"
                step="0.1"
              />
              <span className="input-desc">: 1</span>
            </div>
          </section>

          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>📊</span> 거래 횟수</h2>
            <div className="input-row">
              <input
                type="number"
                className="form-input"
                value={trades}
                onChange={(e) => setTrades(Math.max(1, Number(e.target.value) || 0))}
                min="1"
              />
              <span className="input-suffix">회</span>
            </div>
          </section>

          <section className="input-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>⚠️</span> 거래당 위험 (원금 대비 %)</h2>
            <div className="input-row">
              <input
                type="number"
                className="form-input"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                min="0"
                max="100"
                step="0.5"
              />
              <span className="input-suffix">%</span>
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
            <h2 className="section-title"><span className="section-icon" aria-hidden>📋</span> 계산 결과</h2>
            {result ? (
              <>
                <div className="result-cards">
                  <div className="result-card">
                    <div className="result-label">승리 거래</div>
                    <div className="result-value">{result.winTrades}회</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">패배 거래</div>
                    <div className="result-value">{result.loseTrades}회</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">거래당 기대값</div>
                    <div className="result-value primary">{result.expectancy}%</div>
                  </div>
                  <div className="result-card">
                    <div className="result-label">최종 예상 수익률</div>
                    <div className="result-value">{result.totalReturnPct}%</div>
                  </div>
                </div>

                {returnChartData.length > 0 && (
                  <div className="return-chart-section">
                    <h3 className="ruin-chart-title">거래 횟수에 따른 수익율</h3>
                    <p className="ruin-chart-desc">
                      승률에 따라 이기고 지는 패턴을 반복한 시뮬레이션입니다. (예: 승률 {winRate}% → 10거래당 {Math.round(10 * winRate / 100)}승 {10 - Math.round(10 * winRate / 100)}패 반복)
                    </p>
                    <div className="ruin-chart-wrap">
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={returnChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="trades"
                            type="number"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${v}회`}
                            domain={[0, Math.max(Number(trades) || 1, 1)]}
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${v}%`}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip
                            formatter={(value) => [`${value}%`, '수익율']}
                            labelFormatter={(label) => `거래 ${label}회`}
                            contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }}
                          />
                          <ReferenceLine x={Number(trades)} stroke="#667eea" strokeDasharray="4 4" strokeOpacity={0.7} />
                          <Line type="monotone" dataKey="returnPct" stroke="#667eea" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {ruinChartData.length > 0 && (
                  <div className="ruin-chart-section">
                    <h3 className="ruin-chart-title">연속 손실에 따른 잔고율</h3>
                    <p className="ruin-chart-desc">거래당 위험 {result.riskPerTradePct}%일 때, 연속 손실 횟수에 따라 잔고가 어떻게 줄어드는지 표시합니다.</p>
                    <div className="ruin-chart-wrap">
                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={ruinChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                          <defs>
                            <linearGradient id="ruinChartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#667eea" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#667eea" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="lossCount"
                            type="number"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${v}회`}
                            domain={[0, result.ruinCount]}
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${v}%`}
                            domain={[0, 100]}
                            unit="%"
                          />
                          <Tooltip
                            formatter={(value) => [`${value}%`, '잔고율']}
                            labelFormatter={(label) => `연속 손실 ${label}회`}
                            contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }}
                          />
                          <ReferenceLine y={1} stroke="#dc2626" strokeDasharray="4 4" strokeOpacity={0.9} label={{ value: '실질 청산(1%)', position: 'right', fontSize: 10 }} />
                          <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="#667eea"
                            strokeWidth={2}
                            fill="url(#ruinChartGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="result-card result-card-warning ruin-summary-card">
                      <div className="result-label">청산까지 연속 손실</div>
                      <div className="result-value">{result.ruinCount}회</div>
                      <div className="result-hint">연속 손실 시 잔액이 약 1% 이하</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="result-placeholder">승률과 손익비를 입력하세요.</p>
            )}
          </section>

          <section className="result-section mdd-chart-section">
            <h2 className="section-title"><span className="section-icon" aria-hidden>📉</span> MDD(손실) 복구를 위한 필요 수익율</h2>
            <p className="mdd-chart-desc">낙폭 발생 후 원금 회복에 필요한 수익률입니다.</p>

            <div className="mdd-recovery-charts">
              <div className="mdd-recovery-chart-main">
                <h4 className="mdd-chart-subtitle">손실율 대비 잔고율 · 복구 수익율</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={MDD_RECOVERY_TABLE} margin={{ top: 10, right: 50, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="mddBalanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#667eea" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#667eea" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mdd" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis yAxisId="left" orientation="left" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 'auto']} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0]?.payload
                        if (!d) return null
                        return (
                          <div className="mdd-tooltip">
                            <div>손실율: <strong>{d.mdd}%</strong></div>
                            <div>잔고율: <strong>{d.balance}%</strong></div>
                            <div>복구 수익율: <strong className="mdd-tooltip-recovery">{d.recovery}%</strong></div>
                            <div>손실 대비 수익: <strong>{d.ratio}{d.ratio !== '-' ? '배' : ''}</strong></div>
                          </div>
                        )
                      }}
                      wrapperClassName="mdd-tooltip-wrap"
                    />
                    <Legend />
                    <Area type="monotone" dataKey="balance" yAxisId="left" name="잔고율" fill="url(#mddBalanceGradient)" stroke="#667eea" strokeWidth={2} />
                    <Line type="monotone" dataKey="recoveryNum" yAxisId="right" name="복구 수익율" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mdd-recovery-chart-ratio">
                <h4 className="mdd-chart-subtitle">손실 대비 수익 (복구 수익율 ÷ 손실율)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={MDD_RECOVERY_TABLE} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mdd" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis domain={[0, 'auto']} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}배`} />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toFixed(1)}배`, '손실 대비 수익']}
                      labelFormatter={(label) => `손실율 ${label}%`}
                      contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb' }}
                    />
                    <Line type="monotone" dataKey="ratioNum" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} name="손실 대비 수익" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mdd-recovery-table-wrap">
              <table className="mdd-recovery-table" role="table" aria-label="MDD별 복구 필요 수익률">
                <thead>
                  <tr>
                    <th>손실율</th>
                    <th>잔고율</th>
                    <th>복구 수익율</th>
                    <th>손실 대비 수익</th>
                  </tr>
                </thead>
                <tbody>
                  {MDD_RECOVERY_TABLE.map(({ mdd, balance, recovery, ratio }) => (
                    <tr key={mdd}>
                      <td className="mdd-cell-loss"><strong>{mdd}%</strong></td>
                      <td>{balance}%</td>
                      <td className="mdd-cell-recovery">{recovery}%</td>
                      <td>{ratio}{ratio !== '-' ? '배' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default WinRateCalculator
