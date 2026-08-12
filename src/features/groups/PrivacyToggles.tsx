import { useState } from 'react'
import { ToggleRow } from '../../shared/components/ToggleRow'
import { cardClass } from '../../shared/styles'
import { updatePrivacySetting, useMyPrivacySettings } from './api'
import type { PrivacySettings } from './types'

const FIELDS: { field: keyof PrivacySettings; label: string }[] = [
  { field: 'hide_overall_pnl', label: 'Overall P&L' },
  { field: 'hide_month_pnl', label: 'Past 30 Days P&L' },
  { field: 'hide_week_pnl', label: 'Past 7 Days P&L' },
  { field: 'hide_today_pnl', label: "Today's P&L" },
  { field: 'hide_win_rate', label: 'Win Rate' },
]

export function PrivacyToggles({ userId }: { userId: string }) {
  const { settings, setSettings, loading } = useMyPrivacySettings(userId)
  const [savingField, setSavingField] = useState<keyof PrivacySettings | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async (field: keyof PrivacySettings, value: boolean) => {
    const previous = settings[field]
    setSettings((prev) => ({ ...prev, [field]: value }))
    setSavingField(field)
    setError(null)
    try {
      await updatePrivacySetting(userId, field, value)
    } catch (err) {
      setSettings((prev) => ({ ...prev, [field]: previous }))
      setError(err instanceof Error ? err.message : 'Could not save that setting.')
    } finally {
      setSavingField(null)
    }
  }

  if (loading) {
    return <p className={`p-5 text-sm text-slate-500 ${cardClass}`}>Loading privacy settings…</p>
  }

  return (
    <div className={`flex flex-col gap-1 p-5 ${cardClass}`}>
      <div className="mb-2 flex flex-col gap-0.5">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Privacy
        </h2>
        <p className="text-[11px] text-slate-500">
          Hide a stat from groupmates on leaderboards — you always see your own numbers
        </p>
      </div>

      {FIELDS.map(({ field, label }) => (
        <ToggleRow
          key={field}
          label={label}
          checked={settings[field]}
          disabled={savingField === field}
          onChange={(value) => void handleToggle(field, value)}
        />
      ))}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
