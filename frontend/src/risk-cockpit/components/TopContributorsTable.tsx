import { useMemo } from 'react'
import { AllCommunityModule, ColDef, ModuleRegistry, themeQuartz } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import type { Position, RiskFactor } from '../types'
import { formatGbpCompact, formatPercent, formatSignedGbpCompact } from '../format'
import * as theme from '../theme'

ModuleRegistry.registerModules([AllCommunityModule])

interface TopContributorsTableProps {
  positions: Position[]
  riskFactors: RiskFactor[]
}

interface Row {
  position: string
  instrument: string
  cvar: string
  deltaCvar: string
  cvarPct: string
  risk: string
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

export function TopContributorsTable({ positions, riskFactors }: TopContributorsTableProps) {
  const rows: Row[] = useMemo(
    () =>
      [...positions]
        .sort((a, b) => b.cvar - a.cvar)
        .map((p) => {
          const rf = riskFactors.find((r) => r.id === p.riskFactorId)
          return {
            position: p.positionCode,
            instrument: p.instrument,
            cvar: formatGbpCompact(p.cvar),
            deltaCvar: formatSignedGbpCompact(p.deltaCvar),
            cvarPct: formatPercent(p.cvarPct),
            risk: rf?.label ?? '—',
          }
        }),
    [positions, riskFactors],
  )

  const columnDefs: ColDef<Row>[] = [
    { headerName: 'Position', field: 'position', flex: 1.2 },
    { headerName: 'Instrument', field: 'instrument', flex: 1.4 },
    { headerName: 'CVaR', field: 'cvar', flex: 0.8, cellStyle: { fontWeight: 600 } },
    {
      headerName: 'ΔCVaR',
      field: 'deltaCvar',
      flex: 0.8,
      cellStyle: (p) => ({ color: p.value?.startsWith('+') ? theme.deltaBad : theme.deltaGood }),
    },
    { headerName: 'CVaR %', field: 'cvarPct', flex: 0.7 },
    { headerName: 'Risk Factor', field: 'risk', flex: 1 },
  ]

  return (
    <div style={{ height: 44 + rows.length * 40 }}>
      <AgGridReact
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        rowHeight={40}
        headerHeight={36}
        domLayout="autoHeight"
        suppressCellFocus
      />
    </div>
  )
}
