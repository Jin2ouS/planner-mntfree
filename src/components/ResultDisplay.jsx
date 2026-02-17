import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import './ResultDisplay.css'

function ResultDisplay({ result, inputs }) {
  const [simulationStartAmount, setSimulationStartAmount] = useState('')
  const [simulationReturnRate, setSimulationReturnRate] = useState('')
  const [simulationData, setSimulationData] = useState(null)

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  const formatPercent = (num) => {
    return num.toFixed(2)
  }

  const calculateSimulation = () => {
    if (!simulationStartAmount || !simulationReturnRate) {
      return
    }

    const startAmount = Number(simulationStartAmount)
    const returnRate = Number(simulationReturnRate) / 100
    const years = inputs.targetYears || 1

    const simulationYearlyData = []
    for (let year = 0; year <= years; year++) {
      const asset = startAmount * Math.pow(1 + returnRate, year)
      simulationYearlyData.push({
        year,
        asset: Math.round(asset)
      })
    }

    setSimulationData(simulationYearlyData)
  }

  const handleSimulationStartAmountAdjust = (delta) => {
    const currentValue = Number(simulationStartAmount) || 0
    const newValue = Math.max(0, currentValue + (delta * 100))
    setSimulationStartAmount(newValue.toString())
  }

  const handleSimulationReturnRateAdjust = (delta) => {
    const currentValue = Number(simulationReturnRate) || 0
    const newValue = Math.max(0, currentValue + (delta * 10))
    setSimulationReturnRate(newValue.toString())
  }

  // 차트 데이터에 시뮬레이션 데이터 병합
  const chartData = result.yearlyData.map((data, index) => {
    const chartItem = { ...data }
    if (simulationData && simulationData[index]) {
      chartItem.simulationAsset = simulationData[index].asset
    }
    return chartItem
  })

  return (
    <div className="result-display">
      <h2 className="result-title">📈 계산 결과</h2>

      <div className="result-summary">
        <div className="summary-card primary">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <div className="card-label">필요한 최종 투자자산</div>
            <div className="card-value">{formatNumber(result.targetAsset)} 만원</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">증식해야 할 금액</div>
            <div className="card-value" style={{ color: '#dc2626' }}>{formatNumber(result.targetAsset - inputs.currentAssets)} 만원</div>
          </div>
        </div>

        <div className="summary-card secondary">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <div className="card-label">목표 수익율</div>
            <div className="card-value">{inputs.dividendRate}%</div>
          </div>
        </div>

        <div className="summary-card highlight">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-label">필요 수익율 (CAGR)</div>
            <div className="card-value" style={{ color: '#dc2626' }}>
              {formatPercent(result.requiredAnnualReturn)}%
            </div>
          </div>
        </div>
      </div>

      <div className="yield-comparison">
        <div className="comparison-icon">
          {result.requiredAnnualReturn <= inputs.dividendRate * 0.5 ? '🎉' : 
           result.requiredAnnualReturn <= inputs.dividendRate ? '✅' : 
           result.requiredAnnualReturn <= inputs.dividendRate * 1.5 ? '⚠️' : '🔴'}
        </div>
        <div className="comparison-content">
          <strong>수익율 비교:</strong> 
          {result.requiredAnnualReturn <= inputs.dividendRate * 0.5 ? (
            <> 선택한 수익율({inputs.dividendRate}%)보다 훨씬 낮은 수익률로 충분히 달성 가능합니다! 🎉</>
          ) : result.requiredAnnualReturn <= inputs.dividendRate ? (
            <> 선택한 수익율({inputs.dividendRate}%)로 달성 가능합니다. ✅</>
          ) : result.requiredAnnualReturn <= inputs.dividendRate * 1.5 ? (
            <> 선택한 수익율({inputs.dividendRate}%)보다 약간 높은 투자 수익률({formatPercent(result.requiredAnnualReturn)}%)이 필요합니다. ⚠️</>
          ) : (
            <> 선택한 수익율({inputs.dividendRate}%)보다 훨씬 높은 투자 수익률({formatPercent(result.requiredAnnualReturn)}%)이 필요합니다. 투자 기간을 늘리거나 목표를 조정하는 것을 고려해보세요. 🔴</>
          )}
        </div>
      </div>

      {result.inflationAdjusted && (
        <div className="inflation-notice">
          <div className="notice-icon">📈</div>
          <div className="notice-content">
            <strong>인플레이션 반영됨:</strong> {inputs.inflation}%의 인플레이션을 고려하여 계산되었습니다.
            <br />
            {inputs.targetYears}년 후 월 {formatNumber(inputs.monthlyIncome)}만원의 구매력을 유지하려면 
            실제로는 약 <strong>{formatNumber(result.futureAnnualIncome / 12)}만원</strong>이 필요합니다.
          </div>
        </div>
      )}

      {/* 연도별 차트 */}
      <div className="chart-section">
        <h3 className="section-title">투자 시점별 자산금액</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="year" 
              label={{ value: '년차', position: 'insideBottom', offset: -10 }}
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: '자산 (만원)', angle: -90, position: 'insideLeft', offset: 10 }}
              stroke="#6b7280"
              tickFormatter={(value) => formatNumber(value)}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip 
              formatter={(value, name) => [formatNumber(value) + ' 만원', name]}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line 
              type="monotone" 
              dataKey="asset" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4 }}
              name="필요 수익율"
            />
            <Line 
              type="monotone" 
              dataKey="targetAsset" 
              stroke="#10b981" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              name="목표 수익율"
            />
            {simulationData && (
              <Line 
                type="monotone" 
                dataKey="simulationAsset" 
                stroke="#f59e0b" 
                strokeWidth={3}
                strokeDasharray="3 3"
                dot={{ r: 4 }}
                name={`시뮬레이션 (${simulationReturnRate}%)`}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        <div className="chart-legend-info">
          <div className="legend-item">
            <span className="legend-line required"></span>
            <span>필요 수익율 ({formatPercent(result.requiredAnnualReturn)}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-line target"></span>
            <span>목표 수익율 ({inputs.dividendRate}%)</span>
          </div>
          {simulationData && (
            <div className="legend-item">
              <span className="legend-line simulation"></span>
              <span>시뮬레이션 ({simulationReturnRate}%)</span>
            </div>
          )}
          <div className="legend-gap">
            <strong>GAP:</strong> {formatPercent(inputs.dividendRate - result.requiredAnnualReturn)}%
            {inputs.dividendRate >= result.requiredAnnualReturn ? 
              <span className="gap-positive"> ✅ 달성 가능</span> : 
              <span className="gap-negative"> ⚠️ 수익률 부족</span>
            }
          </div>
        </div>
        <div className="chart-simulation-controls">
          <div className="simulation-title">추가 시뮬레이션</div>
          <div className="simulation-inputs">
            <div className="simulation-input-group">
              <label className="simulation-label">투자 시작금액 (만원)</label>
              <div className="simulation-input-wrapper">
                <input
                  type="number"
                  className="simulation-input"
                  placeholder="예) 200"
                  value={simulationStartAmount}
                  onChange={(e) => setSimulationStartAmount(e.target.value)}
                  min="0"
                />
                <div className="simulation-input-buttons">
                  <button 
                    type="button"
                    className="simulation-input-btn simulation-input-btn-up"
                    onClick={() => handleSimulationStartAmountAdjust(1)}
                    aria-label="100만원 증가"
                  >
                    ▲
                  </button>
                  <button 
                    type="button"
                    className="simulation-input-btn simulation-input-btn-down"
                    onClick={() => handleSimulationStartAmountAdjust(-1)}
                    aria-label="100만원 감소"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
            <div className="simulation-input-group">
              <label className="simulation-label">연수익율 (%)</label>
              <div className="simulation-input-wrapper">
                <input
                  type="number"
                  className="simulation-input"
                  placeholder="예) 10"
                  value={simulationReturnRate}
                  onChange={(e) => setSimulationReturnRate(e.target.value)}
                  min="0"
                  step="0.1"
                />
                <div className="simulation-input-buttons">
                  <button 
                    type="button"
                    className="simulation-input-btn simulation-input-btn-up"
                    onClick={() => handleSimulationReturnRateAdjust(1)}
                    aria-label="10% 증가"
                  >
                    ▲
                  </button>
                  <button 
                    type="button"
                    className="simulation-input-btn simulation-input-btn-down"
                    onClick={() => handleSimulationReturnRateAdjust(-1)}
                    aria-label="10% 감소"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
            <button
              className="simulation-button"
              onClick={calculateSimulation}
              disabled={!simulationStartAmount || !simulationReturnRate}
            >
              차트 표시
            </button>
          </div>
        </div>
      </div>

      {/* 연도별 테이블 */}
      <div className="table-section">
        <h3 className="section-title">년도별 자산 변동</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>연도</th>
                <th>자산</th>
                <th>수익률</th>
                <th>증가액</th>
              </tr>
            </thead>
            <tbody>
              {result.yearlyData.map((data, index) => (
                <tr key={index}>
                  <td>{data.year}년차</td>
                  <td className="text-right asset-cell">
                    {formatNumber(data.asset) + '만원'}
                  </td>
                  <td className="text-right">
                    {index === 0 ? '-' : formatPercent(result.requiredAnnualReturn) + '%'}
                  </td>
                  <td className="text-right">
                    {index === 0 ? '-' : '+' + formatNumber(data.asset - result.yearlyData[index - 1].asset) + '만원'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 추가 인사이트 */}
      <div className="insights-section">
        <h3 className="section-title">💡 추가 인사이트</h3>
        <div className="insight-cards">
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>목표 달성 시</h4>
                <p>
                  {result.inflationAdjusted ? (
                    <>연 {formatNumber(result.futureAnnualIncome)}만원 (월 {formatNumber(result.futureAnnualIncome / 12)}만원)의 현금흐름을 얻게 됩니다.</>
                  ) : (
                    <>연 {formatNumber(inputs.monthlyIncome * 12)}만원 (월 {formatNumber(inputs.monthlyIncome)}만원)의 현금흐름을 얻게 됩니다.</>
                  )}
                </p>
              </div>
            </div>
          <div className="insight-card">
            <div className="insight-icon">📅</div>
            <div className="insight-content">
              <h4>투자 기간</h4>
              <p>{inputs.targetYears}년 동안 꾸준히 투자해야 합니다.</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">💪</div>
            <div className="insight-content">
              <h4>성공 전략</h4>
              <p>
                {result.requiredAnnualReturn > 15 
                  ? '고수익률이 필요합니다. 투자 기간을 늘리거나 목표를 조정하는 것을 고려해보세요.' 
                  : '꾸준한 분산 투자와 장기 투자로 달성 가능한 목표입니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultDisplay
