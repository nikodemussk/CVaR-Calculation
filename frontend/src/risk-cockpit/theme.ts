// Fixed-dark palette for the risk cockpit (trading-terminal convention: this
// view is always dark, not theme-adaptive). Values are the dark-mode steps
// from the validated default palette (see the dataviz skill's palette.md) —
// swap this file's hexes to retarget a different design system.

export const surface = '#1a1a19' // chart/panel surface
export const pagePlane = '#0d0d0d' // page background
export const textPrimary = '#ffffff'
export const textSecondary = '#c3c2b7'
export const textMuted = '#898781'
export const gridline = '#2c2c2a'
export const baseline = '#383835'
export const border = 'rgba(255,255,255,0.10)'

export const deltaGood = '#0ca30c'
export const deltaBad = '#e66767'

export const statusGood = '#0ca30c'
export const statusWarning = '#fab219'
export const statusSerious = '#ec835a'
export const statusCritical = '#d03b3b'

// Categorical, fixed order — never reassign per-render or cycle past this order.
export const categorical = {
  blue: '#3987e5',
  orange: '#d95926',
  aqua: '#199e70',
  yellow: '#c98500',
  magenta: '#d55181',
  green: '#008300',
  violet: '#9085e9',
  red: '#e66767',
} as const

export const categoricalOrder = [
  categorical.blue,
  categorical.orange,
  categorical.aqua,
  categorical.yellow,
  categorical.magenta,
  categorical.green,
  categorical.violet,
  categorical.red,
]

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`
}

// Sequential single-hue ramp (blue), adapted for a dark surface: low
// magnitude recedes toward the surface, high magnitude reads as the full
// saturated categorical blue — the dark-canvas analog of "lightest step
// means near zero" from the light-surface reference ramp.
const sequentialLow = hexToRgb('#22364a')
const sequentialHigh = hexToRgb(categorical.blue)

export function sequentialBlue(intensity: number): string {
  const t = Math.max(0, Math.min(1, intensity))
  const mixed: [number, number, number] = [
    sequentialLow[0] + (sequentialHigh[0] - sequentialLow[0]) * t,
    sequentialLow[1] + (sequentialHigh[1] - sequentialLow[1]) * t,
    sequentialLow[2] + (sequentialHigh[2] - sequentialLow[2]) * t,
  ]
  return rgbToHex(mixed)
}
