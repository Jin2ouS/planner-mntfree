import { useState, useEffect } from 'react'
import './InputForm.css'

function InputForm({ inputs, onInputChange, onCalculate, onReset }) {
  const [previewAsset, setPreviewAsset] = useState(null)
  const [gap, setGap] = useState(null)
  const [requiredReturnPreview, setRequiredReturnPreview] = useState(null)

  // 월 현금흐름 입력 시 필요 자산 미리보기
  useEffect(() => {
    if (inputs.monthlyIncome && inputs.dividendRate) {
      // 인플레이션 고려한 미래 월 현금흐름
      const inflationRate = inputs.inflation / 100
      const years = inputs.targetYears || 0
      const futureMonthlyIncome = inputs.monthlyIncome * Math.pow(1 + inflationRate, years)
      
      const requiredAsset = (futureMonthlyIncome * 12) / (inputs.dividendRate / 100)
      setPreviewAsset(requiredAsset)
      
      // 현재 자산이 입력된 경우 갭 계산
      if (inputs.currentAssets) {
        setGap(requiredAsset - inputs.currentAssets)
      }
    } else {
      setPreviewAsset(null)
      setGap(null)
    }
  }, [inputs.monthlyIncome, inputs.dividendRate, inputs.currentAssets, inputs.inflation, inputs.targetYears])

  // STEP 2와 STEP 3 입력 시 필요 수익율 미리 계산
  useEffect(() => {
    if (inputs.monthlyIncome && inputs.currentAssets && inputs.targetYears) {
      // 인플레이션 고려
      const inflationRate = inputs.inflation / 100
      const futureMonthlyIncome = inputs.monthlyIncome * Math.pow(1 + inflationRate, inputs.targetYears)
      
      // 다양한 수익율에 대한 필요 자산 계산하여 평균적인 필요 수익율 추정
      // 더 정확한 계산: 각 수익율별로 필요한 CAGR 계산
      const yieldRates = [4, 6, 10, 20, 30, 50, 100, 200, 300]
      let minRequiredReturn = Infinity
      
      yieldRates.forEach(rate => {
        const targetAsset = (futureMonthlyIncome * 12) / (rate / 100)
        if (targetAsset > inputs.currentAssets) {
          const requiredReturn = (Math.pow(targetAsset / inputs.currentAssets, 1 / inputs.targetYears) - 1) * 100
          if (requiredReturn < minRequiredReturn) {
            minRequiredReturn = requiredReturn
          }
        }
      })
      
      if (minRequiredReturn !== Infinity) {
        setRequiredReturnPreview(minRequiredReturn)
      }
    } else {
      setRequiredReturnPreview(null)
    }
  }, [inputs.monthlyIncome, inputs.currentAssets, inputs.targetYears, inputs.inflation])

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  const isFormValid = () => {
    return inputs.targetYears && 
           inputs.monthlyIncome && 
           inputs.dividendRate > 0 &&
           inputs.currentAssets
  }

  const targetYearButtons = [
    { value: 1, label: '1년', message: '단기 목표로 시작하시는군요! 🚀' },
    { value: 3, label: '3년', message: '중기 목표로 계획하시는군요! 📈' },
    { value: 5, label: '5년', message: '5년 후를 목표로 하셨군요! 👍' },
    { value: 10, label: '10년', message: '장기 목표로 준비하시는군요! 💪' },
    { value: 20, label: '20년', message: '장기적인 계획이시군요! 🌟' },
    { value: 30, label: '30년', message: '미래를 위한 큰 계획이시군요! 🎯' }
  ]

  const handleTargetYearsAdjust = (delta) => {
    const currentValue = inputs.targetYears || 0
    const newValue = Math.max(0, currentValue + delta)
    onInputChange('targetYears', newValue)
  }

  const handleMonthlyIncomeAdjust = (delta) => {
    const currentValue = inputs.monthlyIncome || 0
    const newValue = Math.max(0, currentValue + (delta * 100))
    onInputChange('monthlyIncome', newValue)
  }

  const handleDividendRateAdjust = (delta) => {
    const currentValue = inputs.dividendRate || 0
    const newValue = Math.max(0, currentValue + (delta * 2))
    onInputChange('dividendRate', newValue)
  }

  const handleCurrentAssetsAdjust = (delta) => {
    const currentValue = inputs.currentAssets || 0
    const newValue = Math.max(0, currentValue + (delta * 100))
    onInputChange('currentAssets', newValue)
  }

  const handleInflationAdjust = (delta) => {
    const currentValue = inputs.inflation || 0
    const newValue = Math.max(0, currentValue + (delta * 0.5))
    onInputChange('inflation', newValue)
  }

  return (
    <div className="input-form">
      <div className="form-section">
        <div className="step-header">
          <div className="step-indicator">STEP 1</div>
          <div className="step-title"><span className="section-icon" aria-hidden>📅</span> 목표 시점</div>
        </div>
        <label className="form-label">
          <span className="label-text">현재부터 투자목표 시점까지의 기간을 입력하세요</span>
          <span className="label-required">*</span>
        </label>
        <div className="input-group">
          <div className="input-wrapper">
            <input 
              type="number"
              className="form-input"
              placeholder="예) 5"
              value={inputs.targetYears}
              onChange={(e) => onInputChange('targetYears', Number(e.target.value))}
              min="0"
            />
            <div className="input-buttons">
              <button 
                type="button"
                className="input-btn input-btn-up"
                onClick={() => handleTargetYearsAdjust(1)}
                aria-label="증가"
              >
                ▲
              </button>
              <button 
                type="button"
                className="input-btn input-btn-down"
                onClick={() => handleTargetYearsAdjust(-1)}
                aria-label="감소"
              >
                ▼
              </button>
            </div>
          </div>
          <span className="input-suffix">년</span>
        </div>
        {inputs.targetYears && (
          <div className="feedback-message success">
            {inputs.targetYears}년 후를 목표로 하셨군요! 👍
          </div>
        )}
        
        <div className="target-year-buttons">
          <div className="comparison-title">📅 목표 기간 선택</div>
          <div className="comparison-grid">
            {targetYearButtons.map(({ value, label, message }) => {
              const isSelected = value === inputs.targetYears
              return (
                <div 
                  key={value} 
                  className={`comparison-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onInputChange('targetYears', value)}
                >
                  <div className="rate">{label}</div>
                  <div className="asset">{message}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="step-header">
          <div className="step-indicator">STEP 2</div>
          <div className="step-title"><span className="section-icon" aria-hidden>💰</span> 목표 금액</div>
        </div>
        <label className="form-label">
          <span className="label-text">원하시는 매월 현금흐름 금액을 입력하세요</span>
          <span className="label-required">*</span>
        </label>
        <div className="input-group">
          <div className="input-wrapper">
            <input 
              type="number"
              className="form-input"
              placeholder="예) 300"
              value={inputs.monthlyIncome}
              onChange={(e) => onInputChange('monthlyIncome', Number(e.target.value))}
              min="0"
            />
            <div className="input-buttons">
              <button 
                type="button"
                className="input-btn input-btn-up"
                onClick={() => handleMonthlyIncomeAdjust(1)}
                aria-label="100만원 증가"
              >
                ▲
              </button>
              <button 
                type="button"
                className="input-btn input-btn-down"
                onClick={() => handleMonthlyIncomeAdjust(-1)}
                aria-label="100만원 감소"
              >
                ▼
              </button>
            </div>
          </div>
          <span className="input-suffix">만원</span>
        </div>
        {inputs.monthlyIncome > 0 && (
          <div className="annual-income-display">
            📅 연간 목표: <strong>{formatNumber(inputs.monthlyIncome * 12)}만원</strong>
          </div>
        )}
        
        <div className="monthly-income-buttons">
          <div className="comparison-title">💰 월 현금흐름 빠른 선택</div>
          <div className="comparison-grid">
            {[
              { value: 100, label: '100만원' },
              { value: 200, label: '200만원' },
              { value: 300, label: '300만원' },
              { value: 500, label: '500만원' },
              { value: 1000, label: '1000만원' },
              { value: 2000, label: '2000만원' },
              { value: 3000, label: '3000만원' },
              { value: 5000, label: '5000만원' },
              { value: 10000, label: '1억원' }
            ].map(({ value, label }) => {
              const isSelected = value === inputs.monthlyIncome
              return (
                <div 
                  key={value} 
                  className={`comparison-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onInputChange('monthlyIncome', value)}
                >
                  <div className="rate">{label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="step-header">
          <div className="step-indicator">STEP 3</div>
          <div className="step-title"><span className="section-icon" aria-hidden>📈</span> 목표 수익율</div>
        </div>
        <label className="form-label">
          <span className="label-text">목표로 하는 연간 수익율을 입력하세요</span>
          <span className="label-required">*</span>
        </label>
        <div className="input-group">
          <div className="input-wrapper">
            <input 
              type="number"
              className="form-input"
              placeholder="예) 30"
              value={inputs.dividendRate}
              onChange={(e) => onInputChange('dividendRate', Number(e.target.value))}
              min="0"
              step="0.1"
            />
            <div className="input-buttons">
              <button 
                type="button"
                className="input-btn input-btn-up"
                onClick={() => handleDividendRateAdjust(1)}
                aria-label="2% 증가"
              >
                ▲
              </button>
              <button 
                type="button"
                className="input-btn input-btn-down"
                onClick={() => handleDividendRateAdjust(-1)}
                aria-label="2% 감소"
              >
                ▼
              </button>
            </div>
          </div>
          <span className="input-suffix">%</span>
        </div>
        <div className="help-text">
          목표 자산에서 받을 연 배당/분배 수익률 (기본값: 4%)
        </div>
        
        <div className="dividend-comparison">
          <div className="comparison-title">💰 투자 유형별 수익율</div>
          <div className="comparison-grid">
            {[
              { rate: 4, label: '예적금' },
              { rate: 6, label: '고배당주' },
              { rate: 10, label: '인덱스펀드' },
              { rate: 20, label: '워런 버핏' },
              { rate: 30, label: '트레이더' },
              { rate: 50, label: '투자의신?' },
              { rate: 100, label: '1년 두배' },
              { rate: 200, label: '1년 3배' },
              { rate: 300, label: '1년 4배' }
            ].map(({ rate, label }) => {
              const isSelected = rate === inputs.dividendRate
              return (
                <div 
                  key={rate} 
                  className={`comparison-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onInputChange('dividendRate', rate)}
                >
                  <div className="rate">{rate}%</div>
                  <div className="asset">{label}</div>
                </div>
              )
            })}
          </div>
        </div>
        
        {previewAsset && (
          <div className="feedback-message info">
            💡 월 {formatNumber(inputs.monthlyIncome)}만원을 받으시려면
            <br />
            약 <strong>{formatNumber(Math.round(previewAsset))}만원</strong>의 자산이 필요합니다
            <br />
            <span className="small-text">(수익율 {inputs.dividendRate}% 기준{inputs.inflation > 0 ? `, 인플레이션 ${inputs.inflation}% 반영` : ''})</span>
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="step-header">
          <div className="step-indicator">STEP 4</div>
          <div className="step-title"><span className="section-icon" aria-hidden>💵</span> 투자 시작 금액</div>
        </div>
        <label className="form-label">
          <span className="label-text">투자를 시작하는 금액을 알려주세요</span>
          <span className="label-required">*</span>
        </label>
        <div className="input-group">
          <div className="input-wrapper">
            <input 
              type="number"
              className="form-input"
              placeholder="예) 5000"
              value={inputs.currentAssets}
              onChange={(e) => onInputChange('currentAssets', Number(e.target.value))}
              min="0"
            />
            <div className="input-buttons">
              <button 
                type="button"
                className="input-btn input-btn-up"
                onClick={() => handleCurrentAssetsAdjust(1)}
                aria-label="100만원 증가"
              >
                ▲
              </button>
              <button 
                type="button"
                className="input-btn input-btn-down"
                onClick={() => handleCurrentAssetsAdjust(-1)}
                aria-label="100만원 감소"
              >
                ▼
              </button>
            </div>
          </div>
          <span className="input-suffix">만원</span>
        </div>
        
        {gap !== null && inputs.currentAssets && (
          <div className="feedback-message info">
            📊 현재 {formatNumber(inputs.currentAssets)}만원 → 목표 {formatNumber(Math.round(previewAsset))}만원
            <br />
            약 <strong>{formatNumber(Math.round(gap))}만원</strong>을 더 증식해야 합니다
          </div>
        )}
        
        <div className="current-assets-buttons">
          <div className="comparison-title">💵 자산 금액 빠른 조정</div>
          <div className="comparison-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div 
              className="comparison-item"
              onClick={() => handleCurrentAssetsAdjust(1)}
            >
              <div className="rate">+100만원</div>
            </div>
            <div 
              className="comparison-item"
              onClick={() => handleCurrentAssetsAdjust(-1)}
            >
              <div className="rate">-100만원</div>
            </div>
            <div 
              className="comparison-item"
              onClick={() => {
                const currentValue = inputs.currentAssets || 0
                const newValue = Math.max(0, currentValue + 1000)
                onInputChange('currentAssets', newValue)
              }}
            >
              <div className="rate">+1000만원</div>
            </div>
            <div 
              className="comparison-item"
              onClick={() => {
                const currentValue = inputs.currentAssets || 0
                const newValue = Math.max(0, currentValue - 1000)
                onInputChange('currentAssets', newValue)
              }}
            >
              <div className="rate">-1000만원</div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="step-header">
          <div className="step-indicator">STEP 5</div>
          <div className="step-title"><span className="section-icon" aria-hidden>📊</span> 물가 상승율</div>
        </div>
        <label className="form-label">
          <span className="label-text">계산에 반영할 연간 인플레이션 비율을 선택하세요</span>
          <span className="label-optional">(선택사항)</span>
        </label>
        <div className="input-group">
          <div className="input-wrapper">
            <input 
              type="number"
              className="form-input"
              placeholder="예) 2"
              value={inputs.inflation}
              onChange={(e) => onInputChange('inflation', Number(e.target.value))}
              min="0"
              step="0.1"
            />
            <div className="input-buttons">
              <button 
                type="button"
                className="input-btn input-btn-up"
                onClick={() => handleInflationAdjust(1)}
                aria-label="0.5% 증가"
              >
                ▲
              </button>
              <button 
                type="button"
                className="input-btn input-btn-down"
                onClick={() => handleInflationAdjust(-1)}
                aria-label="0.5% 감소"
              >
                ▼
              </button>
            </div>
          </div>
          <span className="input-suffix">%</span>
        </div>
        <div className="help-text">
          인플레이션을 고려하여 미래 가치를 조정합니다 (기본값: 0%)
        </div>
        
        <div className="inflation-buttons">
          <div className="comparison-title">📈 인플레이션 수준 선택</div>
          <div className="comparison-grid">
            {[
              { value: 0, label: '0%', description: '미반영' },
              { value: 1, label: '1%', description: '낮음' },
              { value: 2, label: '2%', description: '보통' },
              { value: 3, label: '3%', description: '높음' },
              { value: 4, label: '4%', description: '매우 높음' },
              { value: 6, label: '6%', description: '초고 인플레이션' }
            ].map(({ value, label, description }) => {
              const isSelected = value === inputs.inflation
              return (
                <div 
                  key={value} 
                  className={`comparison-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onInputChange('inflation', value)}
                >
                  <div className="rate">{label}</div>
                  <div className="asset">{description}</div>
                </div>
              )
            })}
          </div>
        </div>
        
        {inputs.inflation > 0 && inputs.monthlyIncome > 0 && inputs.targetYears && (
          <div className="inflation-info">
            <div className="info-icon">📈</div>
            <div className="info-content">
              <strong>인플레이션 반영 시:</strong>
              <br />
              {inputs.targetYears}년 후 월 {formatNumber(inputs.monthlyIncome)}만원의 가치는
              <br />
              현재 약 <strong>{formatNumber(Math.round(inputs.monthlyIncome / Math.pow(1 + inputs.inflation/100, inputs.targetYears)))}만원</strong>과 같습니다.
            </div>
          </div>
        )}
      </div>

      <div className="button-group">
        <button 
          className="btn btn-primary"
          onClick={onCalculate}
          disabled={!isFormValid()}
        >
          계산하기 📊
        </button>
        <button 
          className="btn btn-secondary"
          onClick={onReset}
        >
          초기화
        </button>
      </div>
    </div>
  )
}

export default InputForm
