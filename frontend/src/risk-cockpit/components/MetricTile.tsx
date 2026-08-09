import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { deltaTone, formatSignedGbpCompact, type GoodDirection } from '../format'
import * as theme from '../theme'

interface MeterSpec {
  current: number
  max: number
}

interface MetricTileProps {
  label: string
  value: string
  delta?: number
  goodDirection?: GoodDirection
  meter?: MeterSpec
}

function meterColor(ratio: number): string {
  if (ratio >= 0.9) return theme.statusCritical
  if (ratio >= 0.7) return theme.statusWarning
  return theme.categorical.blue
}

export function MetricTile({ label, value, delta, goodDirection = 'down', meter }: MetricTileProps) {
  const tone = delta !== undefined ? deltaTone(delta, goodDirection) : 'flat'
  const toneColor = tone === 'good' ? theme.deltaGood : tone === 'bad' ? theme.deltaBad : theme.textMuted
  const ratio = meter ? Math.min(1, meter.current / meter.max) : undefined

  return (
    <div
      className="flex flex-1 flex-col gap-1.5 px-5 py-4 min-w-[150px]"
      style={{ borderRight: `1px solid ${theme.border}` }}
    >
      <span className="text-xs font-medium tracking-wider uppercase" style={{ color: theme.textMuted }}>
        {label}
      </span>
      <span className="text-2xl font-semibold" style={{ color: theme.textPrimary }}>
        {value}
      </span>

      {delta !== undefined && (
        <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: toneColor }}>
          {delta >= 0 ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />}
          {formatSignedGbpCompact(delta)}
        </span>
      )}

      {meter && ratio !== undefined && (
        <div className="mt-1 flex flex-col gap-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: '#2a3f57' }}>
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${ratio * 100}%`, backgroundColor: meterColor(ratio) }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
            {(ratio * 100).toFixed(1)}% of limit
          </span>
        </div>
      )}
    </div>
  )
}
