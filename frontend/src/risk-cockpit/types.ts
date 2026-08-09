// Data model for the risk cockpit, shaped around the drill-down hierarchy
// a real risk-attribution backend would serve:
//
//   Desk -> Book -> AssetClass -> RiskFactor -> Position -> Trade
//                                             -> Scenario
//
// Every entity below carries the foreign keys a backend would actually
// return (deskId, bookId, riskFactorId, ...) rather than a pre-nested tree,
// so filtering/drill-down is a query over flat collections, not a walk down
// a fixed shape. Only `headline` (CVaR, VaR, simulated distribution) is
// wired to the real Monte Carlo backend today; everything else here is
// mocked behind this same contract so a backend attribution/limits/PnL
// service can be dropped in later without changing the UI.

export interface Desk {
  id: string
  name: string
}

export interface Book {
  id: string
  deskId: string
  name: string
  limit: number
  pnl: number
  pnlDelta: number
}

export interface AssetClass {
  id: string
  name: string
}

export interface RiskFactor {
  id: string
  assetClassId: string
  label: string
  currency?: string
  tenor?: string
}

export interface Position {
  id: string
  bookId: string
  riskFactorId: string
  positionCode: string
  instrument: string
  cvar: number
  deltaCvar: number
  cvarPct: number
}

export interface Trade {
  id: string
  positionId: string
  tradeDate: string
  quantity: number
  price: number
}

export interface TailScenario {
  id: string
  rank: number
  name: string
  pnlImpact: number
}

export interface AssetClassContribution {
  assetClassId: string
  assetClassName: string
  cvar: number
}

export interface HeatmapCell {
  currency: string
  tenor: string
  intensity: number // 0..1, normalized risk concentration
  cvar: number
}

export interface CVarHistoryPoint {
  timestamp: string
  cvar: number
}

export interface HeadlineMetrics {
  cvar: number
  cvarDelta: number
  varValue: number
  varDelta: number
  pnl: number
  pnlDelta: number
  stress: number
  stressDelta: number
  limit: number
  asOf: string
  /** Sample of the underlying Monte Carlo simulated portfolio-value paths, real backend data when available. */
  simulatedPaths?: number[][]
}

export interface RiskCockpitData {
  desks: Desk[]
  books: Book[]
  assetClasses: AssetClass[]
  riskFactors: RiskFactor[]
  positions: Position[]
  tailScenarios: TailScenario[]
  contributions: AssetClassContribution[]
  heatmap: HeatmapCell[]
  cvarHistory: CVarHistoryPoint[]
  headline: HeadlineMetrics
}
