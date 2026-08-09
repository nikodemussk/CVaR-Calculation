import type {
  AssetClass,
  AssetClassContribution,
  Book,
  Desk,
  HeatmapCell,
  Position,
  RiskCockpitData,
  RiskFactor,
  TailScenario,
} from './types'

// Deterministic mock data shaped to the RiskCockpitData contract. Stands in
// for the attribution/limits/PnL/scenario backend that doesn't exist yet
// (see types.ts) so the cockpit UI can be built and iterated on now; a real
// backend endpoint returning this same shape is a drop-in replacement.

const desks: Desk[] = [{ id: 'desk-rates-fx', name: 'GBP Rates' }]

const books: Book[] = [
  { id: 'book-all', deskId: 'desk-rates-fx', name: 'All', limit: 60_000_000, pnl: 4_200_000, pnlDelta: 800_000 },
]

const assetClasses: AssetClass[] = [
  { id: 'ac-rates', name: 'Rates' },
  { id: 'ac-credit', name: 'Credit' },
  { id: 'ac-curve', name: 'Curve' },
  { id: 'ac-fx', name: 'FX' },
  { id: 'ac-vol', name: 'Vol' },
]

const riskFactors: RiskFactor[] = [
  { id: 'rf-gbp-30y', assetClassId: 'ac-rates', label: 'GBP 30Y', currency: 'GBP', tenor: '30Y' },
  { id: 'rf-eur-10y', assetClassId: 'ac-rates', label: 'EUR 10Y', currency: 'EUR', tenor: '10Y' },
  { id: 'rf-credit-ig', assetClassId: 'ac-credit', label: 'Credit', currency: undefined, tenor: undefined },
]

const positions: Position[] = [
  {
    id: 'pos-1',
    bookId: 'book-all',
    riskFactorId: 'rf-gbp-30y',
    positionCode: 'BOND-18392',
    instrument: 'UKT 2054',
    cvar: 4_820_000,
    deltaCvar: 1_100_000,
    cvarPct: 11.3,
  },
  {
    id: 'pos-2',
    bookId: 'book-all',
    riskFactorId: 'rf-gbp-30y',
    positionCode: 'BOND-29482',
    instrument: 'GILT 2052',
    cvar: 3_710_000,
    deltaCvar: 800_000,
    cvarPct: 8.7,
  },
  {
    id: 'pos-3',
    bookId: 'book-all',
    riskFactorId: 'rf-eur-10y',
    positionCode: 'SWAP-82921',
    instrument: 'EUR 10Y IRS',
    cvar: 3_210_000,
    deltaCvar: 600_000,
    cvarPct: 7.5,
  },
  {
    id: 'pos-4',
    bookId: 'book-all',
    riskFactorId: 'rf-credit-ig',
    positionCode: 'CDS-12982',
    instrument: 'IG Index',
    cvar: 2_840_000,
    deltaCvar: 400_000,
    cvarPct: 6.6,
  },
]

const tailScenarios: TailScenario[] = [
  { id: 'sc-1', rank: 1, name: 'Credit Shock', pnlImpact: -118_200_000 },
  { id: 'sc-2', rank: 2, name: 'Rates Shock', pnlImpact: -102_400_000 },
  { id: 'sc-3', rank: 3, name: 'GBP Curve Twist', pnlImpact: -94_800_000 },
  { id: 'sc-4', rank: 4, name: 'Spread Widening', pnlImpact: -88_300_000 },
]

const contributions: AssetClassContribution[] = [
  { assetClassId: 'ac-rates', assetClassName: 'Rates', cvar: 18_200_000 },
  { assetClassId: 'ac-credit', assetClassName: 'Credit', cvar: 12_700_000 },
  { assetClassId: 'ac-curve', assetClassName: 'Curve', cvar: 5_900_000 },
  { assetClassId: 'ac-fx', assetClassName: 'FX', cvar: 3_100_000 },
  { assetClassId: 'ac-vol', assetClassName: 'Vol', cvar: 2_800_000 },
]

// currency x tenor concentration, 0..1 intensity for the sequential heatmap ramp
const heatmapRaw: Array<[string, string, number]> = [
  ['GBP', '2Y', 0.12], ['GBP', '5Y', 0.38], ['GBP', '10Y', 0.72], ['GBP', '30Y', 0.95],
  ['USD', '2Y', 0.10], ['USD', '5Y', 0.34], ['USD', '10Y', 0.88], ['USD', '30Y', 0.58],
  ['EUR', '2Y', 0.30], ['EUR', '5Y', 0.32], ['EUR', '10Y', 0.60], ['EUR', '30Y', 0.22],
  ['JPY', '2Y', 0.08], ['JPY', '5Y', 0.10], ['JPY', '10Y', 0.28], ['JPY', '30Y', 0.26],
]

const heatmap: HeatmapCell[] = heatmapRaw.map(([currency, tenor, intensity]) => ({
  currency,
  tenor,
  intensity,
  cvar: Math.round(intensity * 18_500_000),
}))

// Trailing CVaR path leading up to the current £42.7m headline, dipping
// then trending up toward the limit (matches the shape in the design mock).
const cvarHistory = [31, 33, 32, 35, 38, 37, 40, 39, 41, 43.5, 41.8, 40.2, 41.5, 42.7].map(
  (millions, i) => ({
    timestamp: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString(),
    cvar: millions * 1_000_000,
  }),
)

export const mockCockpitData: Omit<RiskCockpitData, 'headline'> = {
  desks,
  books,
  assetClasses,
  riskFactors,
  positions,
  tailScenarios,
  contributions,
  heatmap,
  cvarHistory,
}

export const mockHeadlineFallback = {
  cvar: 42_700_000,
  cvarDelta: 3_800_000,
  varValue: 28_300_000,
  varDelta: 1_900_000,
  pnl: 4_200_000,
  pnlDelta: 800_000,
  stress: 91_400_000,
  stressDelta: 7_200_000,
  limit: 60_000_000,
  asOf: new Date().toISOString(),
}
