import type { BetStatus } from '../types/bet'

export const STATUS_TEXT_COLOR: Record<BetStatus, string> = {
  win: 'text-emerald-400',
  loss: 'text-red-400',
  push: 'text-blue-400',
  pending: 'text-slate-400',
}

/** Same mapping as STATUS_TEXT_COLOR, as hex values for SVG/chart fills. */
export const STATUS_HEX: Record<BetStatus, string> = {
  win: '#34d399',
  loss: '#f87171',
  push: '#60a5fa',
  pending: '#94a3b8',
}
