/** YYYY-MM-DD from local date components — never use toISOString() for this, it shifts by a day off UTC+0. */
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** YYYY-MM for calendar-month prefix matching against bet.date — distinct from the rolling time-range windows. */
export function monthPrefix(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
