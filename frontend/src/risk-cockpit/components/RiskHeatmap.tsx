import { useMemo } from 'react'
import { AllCommunityModule, ColDef, ModuleRegistry, themeQuartz } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import type { HeatmapCell } from '../types'
import { formatGbpCompact } from '../format'
import * as theme from '../theme'

ModuleRegistry.registerModules([AllCommunityModule])

interface RiskHeatmapProps {
  cells: HeatmapCell[]
}

interface HeatRow {
  currency: string
  [tenorKey: string]: string | number
}

const gridTheme = themeQuartz.withParams({
  backgroundColor: theme.surface,
  foregroundColor: theme.textPrimary,
  headerTextColor: theme.textMuted,
  headerBackgroundColor: theme.surface,
  borderColor: theme.border,
  fontSize: 12,
})

export function RiskHeatmap({ cells }: RiskHeatmapProps) {
  const currencies = useMemo(() => [...new Set(cells.map((c) => c.currency))], [cells])
  const tenors = useMemo(() => [...new Set(cells.map((c) => c.tenor))], [cells])

  const rows: HeatRow[] = useMemo(
    () =>
      currencies.map((currency) => {
        const row: HeatRow = { currency }
        for (const tenor of tenors) {
          const cell = cells.find((c) => c.currency === currency && c.tenor === tenor)
          row[tenor] = cell?.cvar ?? 0
          row[`${tenor}__intensity`] = cell?.intensity ?? 0
        }
        return row
      }),
    [cells, currencies, tenors],
  )

  const columnDefs: ColDef<HeatRow>[] = useMemo(
    () => [
      {
        headerName: '',
        field: 'currency',
        pinned: 'left',
        width: 70,
        cellStyle: { fontWeight: 600, color: theme.textSecondary },
      },
      ...tenors.map(
        (tenor): ColDef<HeatRow> => ({
          headerName: tenor,
          field: tenor,
          flex: 1,
          valueFormatter: (p) => formatGbpCompact(Number(p.value)),
          cellStyle: (p) => {
            const intensity = Number(p.data?.[`${tenor}__intensity`] ?? 0)
            return {
              backgroundColor: theme.sequentialBlue(intensity),
              color: intensity > 0.55 ? '#ffffff' : theme.textSecondary,
              textAlign: 'center',
              fontWeight: 600,
            }
          },
        }),
      ),
    ],
    [tenors],
  )

  return (
    <div style={{ height: 44 + rows.length * 36 }}>
      <AgGridReact
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        rowHeight={36}
        headerHeight={32}
        domLayout="autoHeight"
        suppressCellFocus
      />
    </div>
  )
}
