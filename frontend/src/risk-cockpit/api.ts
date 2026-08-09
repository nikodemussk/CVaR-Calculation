import { mockHeadlineFallback } from './mockData'
import type { HeadlineMetrics } from './types'

const API_BASE = 'http://127.0.0.1:5000'

// Portfolio notional sent to the Monte Carlo backend, chosen to sit in the
// same order of magnitude as the mocked desk limit (£60m) so the live CVaR/VaR
// tiles read consistently alongside the still-mocked panels below them.
const NOTIONAL = 60_000_000
const HOLDING_PERIOD_DAYS = 9

interface CvarCalculationResponse {
  conditionalValueAtRisk: number
  valueAtRisk: number
  portfolioSimulation: number[][]
}

export interface HeadlineFetchResult {
  headline: HeadlineMetrics
  isLive: boolean
}

// The only panel wired to the real backend today: portfolio CVaR/VaR and the
// simulated path distribution, from the (now vectorized, cached, <5ms)
// Monte Carlo endpoint. Everything else on the cockpit is mock data — see
// mockData.ts — until a real attribution/limits/PnL service exists. Falls
// back to mock headline numbers on any network/backend failure so the
// cockpit stays usable while the Flask dev server is down.
export async function fetchHeadlineMetrics(): Promise<HeadlineFetchResult> {
  try {
    const response = await fetch(`${API_BASE}/api/cvarCalculation`, {
      method: 'POST',
      headers: {
        'X-Version': '1.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stocks: ['MSFT'],
        initialPortfolio: NOTIONAL,
        holdingPeriodInDays: HOLDING_PERIOD_DAYS,
      }),
    })

    if (!response.ok) {
      throw new Error(`cvarCalculation responded ${response.status}`)
    }

    const result: CvarCalculationResponse = await response.json()

    // A successful HTTP response doesn't mean a usable result: if the
    // upstream Yahoo Finance fetch failed or was rate-limited, the Monte
    // Carlo calc silently runs on NaN price data and JSON-serializes those
    // NaNs as null. Treat that the same as a network failure rather than
    // showing a misleading "£0" risk figure.
    if (!Number.isFinite(result.conditionalValueAtRisk) || !Number.isFinite(result.valueAtRisk)) {
      throw new Error('cvarCalculation returned non-finite CVaR/VaR (likely an upstream market-data failure)')
    }

    return {
      isLive: true,
      headline: {
        ...mockHeadlineFallback,
        cvar: result.conditionalValueAtRisk,
        varValue: result.valueAtRisk,
        simulatedPaths: result.portfolioSimulation,
        asOf: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.warn('Live Monte Carlo backend unavailable, falling back to mock headline metrics:', error)
    return { isLive: false, headline: mockHeadlineFallback }
  }
}
