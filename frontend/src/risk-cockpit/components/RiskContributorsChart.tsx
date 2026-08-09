import { useMemo } from 'react'
import { AgCharts } from 'ag-charts-react'
import type { AgChartOptions } from 'ag-charts-community'
import type { AssetClassContribution } from '../types'
import { formatGbpCompact } from '../format'
import * as theme from '../theme'

interface RiskContributorsChartProps {
  contributions: AssetClassContribution[]
}

export function RiskContributorsChart({ contributions }: RiskContributorsChartProps) {
  const options: AgChartOptions = useMemo(() => {
    const sorted = [...contributions].sort((a, b) => a.cvar - b.cvar)
    return {
      data: sorted,
      background: { fill: 'transparent' },
      padding: { top: 6, right: 40, bottom: 6, left: 6 },
      series: [
        {
          type: 'bar',
          direction: 'horizontal',
          xKey: 'assetClassName',
          yKey: 'cvar',
          cornerRadius: 4,
          itemStyler: ({ datum }: any) => {
            const index = sorted.findIndex((c) => c.assetClassId === datum.assetClassId)
            return { fill: theme.categoricalOrder[index % theme.categoricalOrder.length] }
          },
          label: {
            enabled: true,
            color: theme.textPrimary,
            fontWeight: 'bold' as const,
            formatter: ({ value }: { value: number }) => formatGbpCompact(value),
          },
          tooltip: {
            renderer: ({ datum }: any) => ({
              title: datum.assetClassName,
              content: formatGbpCompact(datum.cvar),
            }),
          },
        },
      ],
      axes: [
        {
          type: 'category',
          position: 'left',
          label: { color: theme.textSecondary, fontSize: 12 },
          line: { enabled: false },
          tick: { enabled: false },
          gridLine: { enabled: false },
        },
        {
          type: 'number',
          position: 'bottom',
          label: { enabled: false },
          line: { enabled: false },
          tick: { enabled: false },
          gridLine: { enabled: false },
        },
      ],
      legend: { enabled: false },
    }
  }, [contributions])

  return <AgCharts options={options} style={{ height: 190 }} />
}
