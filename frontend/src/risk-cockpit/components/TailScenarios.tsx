import { useMemo } from 'react'
import { AllCommunityModule, ColDef, ModuleRegistry, themeQuartz } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import type { TailScenario } from '../types'
import { formatGbpCompact } from '../format'
import * as theme from '../theme'

ModuleRegistry.registerModules([AllCommunityModule])

interface TailScenariosProps {
  scenarios: TailScenario[]
}

interface Row {
  rank: string
  name: string
  pnlImpact: string
}

const gridTheme = themeQuartz.withParams({
  backgroundColor: theme.surface,
  foregroundColor: theme.textPrimary,
  headerTextColor: theme.textMuted,
  headerBackgroundColor: theme.surface,
  oddRowBackgroundColor: '#1d1d1c',
  rowHoverColor: '#242422',
  borderColor: theme.border,
  fontSize: 12,
})

export function TailScenarios({ scenarios }: TailScenariosProps) {
  const rows: Row[] = useMemo(
    () =>
      [...scenarios]
        .sort((a, b) => a.rank - b.rank)
        .map((s) => ({
          rank: `#${s.rank}`,
          name: s.name,
          pnlImpact: formatGbpCompact(s.pnlImpact),
        })),
    [scenarios],
  )

  const columnDefs: ColDef<Row>[] = [
    { headerName: 'Rank', field: 'rank', width: 80, cellStyle: { fontWeight: 700, color: theme.textMuted } },
    { headerName: 'Scenario', field: 'name', flex: 1 },
    {
      headerName: 'P&L Impact',
      field: 'pnlImpact',
      width: 130,
      cellStyle: { fontWeight: 700, color: theme.statusCritical, textAlign: 'right' },
    },
  ]

  return (
    <div style={{ height: 44 + rows.length * 38 }}>
      <AgGridReact
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        rowHeight={38}
        headerHeight={32}
        domLayout="autoHeight"
        suppressCellFocus
      />
    </div>
  )
}
