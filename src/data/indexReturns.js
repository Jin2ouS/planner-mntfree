/**
 * 지수별 연도별 수익률(%).
 * 출처: 야후 파이낸스 (Yahoo Finance).
 * 단위: 연간 수익률 퍼센트 (예: 10 = 10%)
 */
const MIN_YEAR = 1900

// S&P 500 연도별 수익률 (1928~, Yahoo Finance ^GSPC 기준)
const SP500 = {
  1928: 43.81, 1929: -8.30, 1930: -25.12, 1931: -43.84, 1932: -8.64, 1933: 49.98, 1934: -1.19,
  1935: 46.74, 1936: 31.94, 1937: -35.34, 1938: 29.28, 1939: -1.10, 1940: -10.67, 1941: -12.77,
  1942: 19.17, 1943: 25.06, 1944: 19.03, 1945: 35.82, 1946: -8.43, 1947: 5.20, 1948: 5.70,
  1949: 18.30, 1950: 30.81, 1951: 23.68, 1952: 18.15, 1953: -1.21, 1954: 52.56, 1955: 32.60,
  1956: 7.44, 1957: -10.46, 1958: 43.72, 1959: 12.06, 1960: 0.34, 1961: 26.64, 1962: -8.81,
  1963: 22.61, 1964: 16.42, 1965: 12.40, 1966: -9.97, 1967: 23.80, 1968: 10.81, 1969: -8.24,
  1970: 3.56, 1971: 14.22, 1972: 18.76, 1973: -14.31, 1974: -25.90, 1975: 37.00, 1976: 23.83,
  1977: -6.98, 1978: 6.51, 1979: 18.52, 1980: 31.74, 1981: -4.70, 1982: 20.42, 1983: 22.34,
  1984: 6.15, 1985: 31.24, 1986: 18.49, 1987: 5.81, 1988: 16.54, 1989: 31.48, 1990: -3.06,
  1991: 30.23, 1992: 7.49, 1993: 9.97, 1994: 1.33, 1995: 37.20, 1996: 22.68, 1997: 33.10,
  1998: 28.34, 1999: 20.89, 2000: -9.03, 2001: -11.85, 2002: -21.97, 2003: 28.36, 2004: 10.74,
  2005: 4.83, 2006: 15.61, 2007: 5.48, 2008: -36.55, 2009: 25.94, 2010: 14.82, 2011: 2.10,
  2012: 15.89, 2013: 32.15, 2014: 13.52, 2015: 1.38, 2016: 11.77, 2017: 21.61, 2018: -4.23,
  2019: 31.21, 2020: 18.02, 2021: 28.47, 2022: -18.04, 2023: 26.06, 2024: 24.88,
  2025: 17.78
}

// 나스닥 (Nasdaq Composite) 연도별 수익률 (1972~, Yahoo Finance ^IXIC 기준)
const NASDAQ = {
  1972: 19.0, 1973: -31.1, 1974: -35.1, 1975: 29.8, 1976: 26.2, 1977: -17.2, 1978: 12.3,
  1979: 28.1, 1980: 33.9, 1981: -5.0, 1982: 21.4, 1983: 19.9, 1984: -2.1, 1985: 31.2,
  1986: 7.2, 1987: -11.2, 1988: 15.7, 1989: 19.2, 1990: -17.8, 1991: 56.8, 1992: 15.5,
  1993: 14.8, 1994: -2.9, 1995: 39.9, 1996: 22.7, 1997: 21.6, 1998: 39.6, 1999: 85.6,
  2000: -39.3, 2001: -21.1, 2002: -31.5, 2003: 50.0, 2004: 8.6, 2005: 1.4, 2006: 9.5,
  2007: 9.8, 2008: -40.5, 2009: 43.9, 2010: 16.9, 2011: -1.8, 2012: 15.9, 2013: 38.3,
  2014: 13.4, 2015: 5.7, 2016: 7.5, 2017: 28.2, 2018: -3.9, 2019: 35.2, 2020: 43.6,
  2021: 21.4, 2022: -33.1, 2023: 43.4, 2024: 28.2,
  2025: 29.2
}

// SCHD 연도별 수익률 (2012~, Yahoo Finance SCHD 기준)
const SCHD = {
  2012: 14.2, 2013: 25.4, 2014: 13.4, 2015: -1.4, 2016: 13.4, 2017: 13.3, 2018: -5.3,
  2019: 25.1, 2020: 11.4, 2021: 29.4, 2022: -3.5, 2023: 11.2, 2024: 8.5,
  2025: 9.2
}

// 코스피 연도별 수익률 (1980~, Yahoo Finance ^KS11 기준)
const KOSPI = {
  1980: 38.9, 1981: -20.4, 1982: 35.2, 1983: 25.2, 1984: -3.0, 1985: 24.7, 1986: 29.4,
  1987: 11.8, 1988: 72.1, 1989: 6.7, 1990: -23.2, 1991: 10.7, 1992: -11.2, 1993: 23.4,
  1994: 19.6, 1995: -14.1, 1996: 32.6, 1997: -42.2, 1998: 49.1, 1999: 82.8, 2000: -50.9,
  2001: 37.4, 2002: -9.4, 2003: 29.7, 2004: 10.5, 2005: 53.7, 2006: 4.0, 2007: 32.3,
  2008: -40.7, 2009: 49.7, 2010: 21.9, 2011: -10.9, 2012: 9.4, 2013: 0.7, 2014: -4.8,
  2015: 2.4, 2016: 3.3, 2017: 21.8, 2018: -17.3, 2019: 7.7, 2020: 30.8, 2021: 3.6,
  2022: -24.9, 2023: 18.7, 2024: 22.1,
  2025: 75.8
}

// 코스닥 연도별 수익률 (1997~, Yahoo Finance ^KQ11 기준)
const KOSDAQ = {
  1997: -29.2, 1998: 24.9, 1999: 241.9, 2000: -57.2, 2001: 37.6, 2002: -30.2, 2003: 78.4,
  2004: 27.2, 2005: 14.6, 2006: 2.9, 2007: 12.3, 2008: -40.3, 2009: 49.2, 2010: 18.7,
  2011: -27.2, 2012: 19.7, 2013: 26.4, 2014: 2.1, 2015: 22.9, 2016: 26.4, 2017: 26.8,
  2018: -26.4, 2019: 27.6, 2020: 45.0, 2021: 2.1, 2022: -28.4, 2023: 27.3, 2024: 15.2,
  2025: 36.5
}

// 금 연도별 수익률 USD (1975~2004 LBMA/역사자료, 2005~ Yahoo Finance GLD 기준)
const GOLD = {
  1975: -24.80, 1976: -4.10, 1977: 22.64, 1978: 37.01, 1979: 126.55, 1980: 15.19, 1981: -32.60,
  1982: 15.62, 1983: -16.80, 1984: -19.38, 1985: 6.00, 1986: 18.96, 1987: 24.53, 1988: -15.26,
  1989: -2.84, 1990: -3.11, 1991: -8.56, 1992: -5.73, 1993: 17.68, 1994: -2.17, 1995: 0.98,
  1996: -4.59, 1997: -21.41, 1998: -0.83, 1999: 0.85, 2000: -5.44, 2001: 0.75, 2002: 25.57,
  2003: 19.89, 2004: 4.65, 2005: 17.76, 2006: 22.55, 2007: 30.45, 2008: 4.92, 2009: 24.03,
  2010: 29.27, 2011: 9.57, 2012: 6.60, 2013: -28.33, 2014: -2.19, 2015: -10.67, 2016: 8.03,
  2017: 12.81, 2018: -1.94, 2019: 17.86, 2020: 24.81, 2021: -4.15, 2022: -0.77, 2023: 12.69,
  2024: 26.66, 2025: 63.68
}

// 비트코인 연도별 수익률 USD (2011~, Yahoo Finance BTC-USD 기준, 해당 연도 1/1~12/31)
// 2025: 1/1 시작 102,402 → 12/31 종료 89,102 → (89102-102402)/102402 = -12.97%
const BITCOIN = {
  2011: 1436.7, 2012: 193.5, 2013: 5471.5, 2014: -57.5, 2015: 34.5, 2016: 123.6,
  2017: 1369.0, 2018: -73.6, 2019: 92.2, 2020: 303.0, 2021: 59.7, 2022: -64.3,
  2023: 155.4, 2024: 121.0, 2025: -13.0
}

// 비트코인 연도별 실제 가격 USD (Yahoo Finance BTC-USD, 해당 연도 시작·종료)
const BITCOIN_PRICES = {
  2011: { start: 0.30, end: 4.61 },
  2012: { start: 4.61, end: 13.53 },
  2013: { start: 13.53, end: 754.01 },
  2014: { start: 754.01, end: 320.19 },
  2015: { start: 320.19, end: 430.57 },
  2016: { start: 430.57, end: 963.74 },
  2017: { start: 963.74, end: 14156.40 },
  2018: { start: 14156.40, end: 3742.70 },
  2019: { start: 3742.70, end: 7193.60 },
  2020: { start: 7193.60, end: 29001.72 },
  2021: { start: 29001.72, end: 46306.45 },
  2022: { start: 46306.45, end: 16547.50 },
  2023: { start: 16547.50, end: 42265.19 },
  2024: { start: 42265.19, end: 93429.20 },
  2025: { start: 102402, end: 89102 }
}

const YAHOO_BASE = 'https://finance.yahoo.com/quote/'

// 표시 순서: S&P, NASDAQ, SCHD, GOLD, BITCOIN, KOSPI, KOSDAQ
const INDEX_DATA = {
  sp500: { label: '에스앤피', labelEn: 'S&P', labelKo: '에스앤피', returns: SP500, ticker: '^GSPC', sourceUrl: `${YAHOO_BASE}%5EGSPC`, valueLabel: '지수' },
  nasdaq: { label: '나스닥', labelEn: 'NASDAQ', labelKo: '나스닥', returns: NASDAQ, ticker: '^IXIC', sourceUrl: `${YAHOO_BASE}%5EIXIC`, valueLabel: '지수' },
  schd: { label: '슈드', labelEn: 'SCHD', labelKo: '슈드', returns: SCHD, ticker: 'SCHD', sourceUrl: `${YAHOO_BASE}SCHD`, valueLabel: '주가(USD)' },
  gold: { label: '금', labelEn: 'GOLD', labelKo: '금', returns: GOLD, ticker: 'GLD', sourceUrl: `${YAHOO_BASE}GLD`, valueLabel: 'GLD(USD)' },
  bitcoin: { label: '비트코인', labelEn: 'BITCOIN', labelKo: '비트코인', returns: BITCOIN, ticker: 'BTC-USD', sourceUrl: `${YAHOO_BASE}BTC-USD`, valueLabel: 'USD', yearlyPrices: BITCOIN_PRICES },
  kospi: { label: '코스피', labelEn: 'KOSPI', labelKo: '코스피', returns: KOSPI, ticker: '^KS11', sourceUrl: `${YAHOO_BASE}%5EKS11`, valueLabel: '지수' },
  kosdaq: { label: '코스닥', labelEn: 'KOSDAQ', labelKo: '코스닥', returns: KOSDAQ, ticker: '^KQ11', sourceUrl: `${YAHOO_BASE}%5EKQ11`, valueLabel: '지수' }
}

export function getMinYear() {
  return MIN_YEAR
}

/** 선택 가능한 종료 시점 최대값 = 데이터가 있는 마지막 연도 */
export function getMaxYear() {
  let max = MIN_YEAR
  for (const { returns } of Object.values(INDEX_DATA)) {
    const years = Object.keys(returns).map(Number)
    if (years.length) max = Math.max(max, ...years)
  }
  return max
}

export function getIndexOptions() {
  return Object.entries(INDEX_DATA).map(([id, { label, labelEn, labelKo }]) => ({
    id,
    label,
    labelEn: labelEn ?? label,
    labelKo: labelKo ?? label
  }))
}

/** 선택한 투자 대상의 Yahoo Finance 티커 및 URL. 없으면 null. */
export function getSourceInfo(indexId) {
  const data = INDEX_DATA[indexId]
  if (!data || !data.ticker || !data.sourceUrl) return null
  return { ticker: data.ticker, url: data.sourceUrl }
}

/** 해당 자산 값의 단위 라벨 (예: USD, 지수). */
export function getValueLabel(indexId) {
  return INDEX_DATA[indexId]?.valueLabel ?? ''
}

/**
 * 선택 기간 내 연도별 데이터: 년도, 해당 자산의 시작값·종료값, 상승율.
 * yearlyPrices가 있으면 실제 가격 사용, 없으면 첫 해 시작=100 지수.
 */
export function getYearlyPrices(indexId, startYear, endYear) {
  const data = INDEX_DATA[indexId]
  if (!data) return []
  const range = getReturnsInRange(indexId, startYear, endYear).filter((r) => r.returnPct != null)
  if (range.length === 0) return []
  const prices = data.yearlyPrices
  if (prices) {
    return range
      .filter((r) => prices[r.year])
      .map(({ year, returnPct }) => ({
        year,
        startPrice: prices[year].start,
        endPrice: prices[year].end,
        returnPct
      }))
  }
  let startPrice = 100
  return range.map(({ year, returnPct }) => {
    const endPrice = startPrice * (1 + returnPct / 100)
    const row = { year, startPrice, endPrice, returnPct }
    startPrice = endPrice
    return row
  })
}

/**
 * 해당 지수의 특정 연도 수익률(%). 없으면 null.
 */
export function getReturn(indexId, year) {
  const data = INDEX_DATA[indexId]
  if (!data) return null
  const ret = data.returns[year]
  return ret === undefined ? null : ret
}

/**
 * 해당 지수에 데이터가 있는 연도 목록 (오름차순).
 */
export function getAvailableYears(indexId) {
  const data = INDEX_DATA[indexId]
  if (!data) return []
  return Object.keys(data.returns)
    .map(Number)
    .sort((a, b) => a - b)
}

/**
 * 선택 기간 내 연도별 수익률 배열. { year, returnPct } 형태.
 * 데이터 없는 연도는 returnPct: null.
 */
export function getReturnsInRange(indexId, startYear, endYear) {
  const arr = []
  for (let y = startYear; y <= endYear; y++) {
    arr.push({ year: y, returnPct: getReturn(indexId, y) })
  }
  return arr
}

/**
 * 기간 내 실제 수익률만으로 수치 시뮬레이션.
 * lump: 최초 매수금액만 투자 후 연도별 수익률 적용.
 * dca: 최초 매수금액 + 매년 초 년간 매수금액 투입 후 해당 연도 수익률 적용.
 * 반환: { yearlyData: [{ year, value, returnPct }], totalReturnPct, cagr, mdd, endValue }
 */
export function simulate(indexId, startYear, endYear, purchaseMethod, initialAmount, annualAmount) {
  const returnsInRange = getReturnsInRange(indexId, startYear, endYear)
  const yearlyData = []
  let value = 0
  let peak = 0
  let mdd = 0

  for (let i = 0; i < returnsInRange.length; i++) {
    const { year, returnPct } = returnsInRange[i]
    if (purchaseMethod === 'lump') {
      if (i === 0) value = initialAmount
    } else {
      value += i === 0 ? initialAmount : annualAmount
    }
    if (returnPct !== null) {
      value = value * (1 + returnPct / 100)
    }
    if (value > peak) peak = value
    const drawdown = peak > 0 ? ((peak - value) / peak) * 100 : 0
    if (drawdown > mdd) mdd = drawdown
    yearlyData.push({ year, value, returnPct })
  }

  const years = endYear - startYear + 1
  const totalInvested = purchaseMethod === 'lump'
    ? initialAmount
    : initialAmount + annualAmount * Math.max(0, years - 1)
  const totalReturnPct = totalInvested > 0 ? ((value - totalInvested) / totalInvested) * 100 : 0
  const cagr = years > 0 && value > 0 && totalInvested > 0
    ? (Math.pow(value / totalInvested, 1 / years) - 1) * 100
    : 0

  return { yearlyData, totalReturnPct, cagr, mdd, endValue: value }
}

export default INDEX_DATA
