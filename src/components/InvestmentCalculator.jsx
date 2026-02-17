import { useState } from 'react'
import InputForm from './InputForm'
import ResultDisplay from './ResultDisplay'
import { calculateInvestmentGoal } from '../utils/calculator'
import './InvestmentCalculator.css'

function InvestmentCalculator() {
  const [inputs, setInputs] = useState({
    targetYears: '',
    monthlyIncome: '',
    dividendRate: 4,
    currentAssets: '',
    inflation: 0
  })

  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCalculate = () => {
    const calculatedResult = calculateInvestmentGoal(inputs)
    setResult(calculatedResult)
    setShowResult(true)
  }

  const handleReset = () => {
    setInputs({
      targetYears: '',
      monthlyIncome: '',
      dividendRate: 4,
      currentAssets: '',
      inflation: 0
    })
    setResult(null)
    setShowResult(false)
  }

  return (
    <div id="investment-calculator" className="calculator-container">
      <header className="calculator-header">
        <h1>💰 투자 목표 계산기</h1>
        <p className="subtitle">목표 달성을 위한 필요 수익률을 계산해보세요</p>
      </header>

      <div className="calculator-content">
        <div className="calculator-input-panel">
          <h2 className="panel-title panel-title-input">✏️ 입력하기</h2>
          <InputForm 
            inputs={inputs}
            onInputChange={handleInputChange}
            onCalculate={handleCalculate}
            onReset={handleReset}
          />
        </div>
        <div className="calculator-result-panel">
          <h2 className="panel-title panel-title-result">📊 결과보기</h2>
          {showResult && result && (
            <ResultDisplay result={result} inputs={inputs} />
          )}
        </div>
      </div>
    </div>
  )
}

export default InvestmentCalculator
