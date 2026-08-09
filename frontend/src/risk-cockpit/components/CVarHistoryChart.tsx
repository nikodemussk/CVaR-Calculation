import { useMemo } from 'react'
import { AgCharts } from 'ag-charts-react'
import type { AgChartOptions } from 'ag-charts-community'
import type { CVarHistoryPoint } from '../types'
import { formatGbpCompact } from '../format'
import * as theme from '../theme'

interface CVarHistoryChartProps {
  points: CVarHistoryPoint[]
  limit: number
}

export function CVarHistoryChart({ points, limit }: CVarHistoryChartProps) {
  const options: AgChartOptions = useMemo(
    () => ({
      data: points.map((p) => ({ date: new Date(p.timestamp), cvar: p.cvar })),
      background: { fill: 'transparent' },
      padding: { top: 10, right: 16, bottom: 8, left: 8 },
      series: [
        {
          type: 'line',
          xKey: 'date',
          yKey: 'cvar',
          stroke: theme.categorical.blue,
          strokeWidth: 2,
          marker: { enabled: false },
          tooltip: {
            renderer: ({ datum }: any) => ({
              title: new Date(datum.date).toLocaleDateString('en-GB'),
              content: formatGbpCompact(datum.cvar),
            }),
          },
        },
      ],
      axes: [
        {
          type: 'time',
          position: 'bottom',
          label: { color: theme.textMuted, fontSize: 10 },
          gridLine: { enabled: false },
          line: { stroke: theme.baseline },
          tick: { stroke: theme.baseline },
        },
        {
          type: 'number',
          position: 'left',
          label: {
            color: theme.textMuted,
            fontSize: 10,
            formatter: ({ value }: { value: number }) => formatGbpCompact(value),
          },
          gridLine: { style: [{ stroke: theme.gridline, lineDash: [1, 0] }] },
          line: { enabled: false },
          tick: { enabled: false },
          crossLines: [
            {
              type: 'line',
              value: limit,
              stroke: theme.statusCritical,
              strokeWidth: 1.5,
              lineDash: [4, 3],
              label: {
                text: `LIMIT ${formatGbpCompact(limit)}`,
                position: 'top-left',
                color: theme.statusCritical,
                fontSize: 10,
                fontWeight: 'bold',
              },
            },
          ],
        },
      ],
      legend: { enabled: false },
    }),
    [points, limit],
  )

  return <AgCharts options={options} style={{ height: 220 }} />
}
