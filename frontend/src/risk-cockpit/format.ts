export function formatGbpCompact(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}£${(abs / 1_000_000).toFixed(1)}m`
  if (abs >= 1_000) return `${sign}£${(abs / 1_000).toFixed(1)}k`
  return `${sign}£${abs.toFixed(0)}`
}

export function formatSignedGbpCompact(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${formatGbpCompact(value)}`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

/** Direction that counts as "good" for a metric, used to color its delta. */
export type GoodDirection = 'up' | 'down'

export function deltaTone(delta: number, goodDirection: GoodDirection): 'good' | 'bad' | 'flat' {
  if (delta === 0) return 'flat'
  const isUp = delta > 0
  const isGood = goodDirection === 'up' ? isUp : !isUp
  return isGood ? 'good' : 'bad'
}
