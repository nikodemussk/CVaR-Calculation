import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { fetchHeadlineMetrics } from './api'
import { mockCockpitData, mockHeadlineFallback } from './mockData'
import type { HeadlineMetrics } from './types'
import { formatGbpCompact } from './format'
import { MetricTile } from './components/MetricTile'
import { Panel } from './components/Panel'
import { CVarHistoryChart } from './components/CVarHistoryChart'
import { RiskContributorsChart } from './components/RiskContributorsChart'
import { RiskHeatmap } from './components/RiskHeatmap'
import { TopContributorsTable } from './components/TopContributorsTable'
import { TailScenarios } from './components/TailScenarios'
import { WhatIfTradeModal } from './components/WhatIfTradeModal'
import * as theme from './theme'

export const RiskCockpit = () => {
  const [headline, setHeadline] = useState<HeadlineMetrics>(mockHeadlineFallback)
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [whatIfOpen, setWhatIfOpen] = useState(false)

  const positionsRef = useRef<HTMLDivElement>(null)
  const scenariosRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchHeadlineMetrics().then(({ headline, isLive }) => {
      if (cancelled) return
      setHeadline(headline)
      setIsLive(isLive)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const data = mockCockpitData

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.pagePlane, color: theme.textPrimary }}>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 sm:p-6">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-wide">RISK COCKPIT</h1>
            <span
              className="rounded px-2 py-0.5 text-xs font-semibold tracking-wide"
              style={{ backgroundColor: theme.gridline, color: theme.textSecondary }}
            >
              {data.desks[0]?.name.toUpperCase()}
            </span>
            <span
              className="rounded px-2 py-0.5 text-xs font-semibold tracking-wide"
              style={{ backgroundColor: theme.gridline, color: theme.textSecondary }}
            >
              BOOK: {data.books[0]?.name.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: theme.textSecondary }}>
              <span
                className="inline-block size-2 rounded-full"
                style={{
                  backgroundColor: loading ? theme.textMuted : isLive ? theme.deltaGood : theme.statusWarning,
                }}
              />
              {loading ? 'CONNECTING' : isLive ? 'LIVE' : 'SAMPLE DATA'}
            </span>
            <Link to="/simulation" className="text-xs font-medium hover:underline" style={{ color: theme.textMuted }}>
              Monte Carlo Simulation View →
            </Link>
          </div>
        </div>

        {!isLive && !loading && (
          <div
            className="rounded-md px-3 py-2 text-xs"
            style={{ backgroundColor: '#332a17', color: theme.statusWarning, border: `1px solid ${theme.statusWarning}33` }}
          >
            Live Monte Carlo backend unreachable — CVaR / VaR tiles and the distribution behind them are showing
            sample data. Contributors, heatmap, positions, and scenarios below are illustrative mock data pending a
            backend attribution/limits/PnL service.
          </div>
        )}

        {/* metric strip */}
        <div
          className="flex flex-wrap overflow-hidden rounded-lg"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
        >
          <MetricTile label="CVaR" value={formatGbpCompact(headline.cvar)} delta={headline.cvarDelta} goodDirection="down" />
          <MetricTile label="VaR" value={formatGbpCompact(headline.varValue)} delta={headline.varDelta} goodDirection="down" />
          <MetricTile label="P&L" value={formatGbpCompact(headline.pnl)} delta={headline.pnlDelta} goodDirection="up" />
          <MetricTile label="Stress" value={formatGbpCompact(headline.stress)} delta={headline.stressDelta} goodDirection="down" />
          <MetricTile
            label="Limit"
            value={formatGbpCompact(headline.limit)}
            meter={{ current: headline.cvar, max: headline.limit }}
          />
        </div>

        {/* history + contributors */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Panel title="CVaR History">
            <CVarHistoryChart points={data.cvarHistory} limit={headline.limit} />
          </Panel>
          <Panel title="Risk Contributors">
            <RiskContributorsChart contributions={data.contributions} />
          </Panel>
        </div>

        {/* heatmap */}
        <Panel title="Risk Heatmap — Currency x Tenor">
          <RiskHeatmap cells={data.heatmap} />
        </Panel>

        {/* top contributors table */}
        <div ref={positionsRef}>
          <Panel title="Top CVaR Contributors">
            <TopContributorsTable positions={data.positions} riskFactors={data.riskFactors} />
          </Panel>
        </div>

        {/* tail scenarios */}
        <div ref={scenariosRef}>
          <Panel title="Worst Tail Scenarios">
            <TailScenarios scenarios={data.tailScenarios} />
          </Panel>
        </div>

        {/* action bar */}
        <div className="flex flex-wrap gap-3 pb-4">
          <button
            type="button"
            onClick={() => setWhatIfOpen(true)}
            className="rounded-md px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: theme.categorical.blue, color: '#ffffff' }}
          >
            What-If Trade
          </button>
          <button
            type="button"
            onClick={() => scenariosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="rounded-md px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: theme.gridline, color: theme.textPrimary }}
          >
            View Scenarios
          </button>
          <button
            type="button"
            onClick={() => positionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="rounded-md px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: theme.gridline, color: theme.textPrimary }}
          >
            View Positions
          </button>
        </div>
      </div>

      <WhatIfTradeModal open={whatIfOpen} onClose={() => setWhatIfOpen(false)} />
    </div>
  )
}
