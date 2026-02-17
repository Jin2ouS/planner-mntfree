/**
 * 투자 목표 계산 함수
 * @param {Object} inputs - 사용자 입력값
 * @returns {Object} 계산 결과
 */
export function calculateInvestmentGoal(inputs) {
  const { targetYears, monthlyIncome, currentAssets, dividendRate, inflation = 0 } = inputs

  // 인플레이션율
  const inflationRate = inflation / 100

  // 1. 인플레이션을 고려한 미래 월 현금흐름 계산
  // 미래 가치 = 현재 가치 × (1 + 인플레이션율) ^ 기간
  const futureMonthlyIncome = monthlyIncome * Math.pow(1 + inflationRate, targetYears)
  
  // 2. 목표 자산 계산
  // 목표 자산 = 미래 월 현금흐름 × 12 / (배당수익률 / 100)
  const targetAsset = (futureMonthlyIncome * 12) / (dividendRate / 100)

  // 3. 필요한 연평균 수익률 계산 (CAGR - Compound Annual Growth Rate)
  // CAGR = ((최종값 / 초기값) ^ (1 / 기간)) - 1
  const requiredAnnualReturn = (Math.pow(targetAsset / currentAssets, 1 / targetYears) - 1) * 100

  // 4. 연도별 자산 증가 시뮬레이션
  const yearlyData = []
  let currentYearAsset = currentAssets
  let targetRateAsset = currentAssets

  // 0년차 (현재)
  yearlyData.push({
    year: 0,
    asset: currentAssets,
    targetAsset: currentAssets
  })

  // 각 연도별 자산 계산
  for (let year = 1; year <= targetYears; year++) {
    // 필요 수익율로 계산된 자산
    currentYearAsset = currentYearAsset * (1 + requiredAnnualReturn / 100)
    // 목표 수익율(dividendRate)로 계산된 자산
    targetRateAsset = targetRateAsset * (1 + dividendRate / 100)
    
    yearlyData.push({
      year: year,
      asset: currentYearAsset,
      targetAsset: targetRateAsset
    })
  }

  return {
    targetAsset,
    requiredAnnualReturn,
    yearlyData,
    annualIncome: monthlyIncome * 12,
    futureAnnualIncome: futureMonthlyIncome * 12,
    inflationAdjusted: inflation > 0
  }
}

/**
 * 숫자를 한국 통화 형식으로 포맷
 */
export function formatCurrency(number) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(number))
}

/**
 * 퍼센트 포맷
 */
export function formatPercent(number, decimals = 2) {
  return number.toFixed(decimals)
}
