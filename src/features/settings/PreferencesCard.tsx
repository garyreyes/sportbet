import { useState } from 'react'
import { cardClass, inputClass, primaryButtonClass, secondaryButtonClass } from '../../shared/styles'
import { updateCurrency, updateDateFormat, updateOddsFormat, useMyProfile } from './api'
import { CURRENCY_PRESETS, type DateFormat, type OddsFormat } from './types'

const DATE_FORMATS: { value: DateFormat; label: string }[] = [
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
]

export function PreferencesCard({ userId }: { userId: string }) {
  const { profile, setProfile, loading } = useMyProfile(userId)
  const [customCurrency, setCustomCurrency] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading || !profile) {
    return <p className={`p-5 text-sm text-slate-500 ${cardClass}`}>Loading preferences…</p>
  }

  const handleCurrencyChange = async (value: string) => {
    if (!value) return
    setError(null)
    const previous = profile.currency
    setProfile((prev) => (prev ? { ...prev, currency: value } : prev))
    try {
      await updateCurrency(userId, value)
    } catch (err) {
      setProfile((prev) => (prev ? { ...prev, currency: previous } : prev))
      setError(err instanceof Error ? err.message : 'Could not save your currency.')
    }
  }

  const handleOddsFormatChange = async (value: OddsFormat) => {
    setError(null)
    const previous = profile.odds_format
    setProfile((prev) => (prev ? { ...prev, odds_format: value } : prev))
    try {
      await updateOddsFormat(userId, value)
    } catch (err) {
      setProfile((prev) => (prev ? { ...prev, odds_format: previous } : prev))
      setError(err instanceof Error ? err.message : 'Could not save your odds format.')
    }
  }

  const handleDateFormatChange = async (value: DateFormat) => {
    setError(null)
    const previous = profile.date_format
    setProfile((prev) => (prev ? { ...prev, date_format: value } : prev))
    try {
      await updateDateFormat(userId, value)
    } catch (err) {
      setProfile((prev) => (prev ? { ...prev, date_format: previous } : prev))
      setError(err instanceof Error ? err.message : 'Could not save your date format.')
    }
  }

  const isPreset = CURRENCY_PRESETS.includes(profile.currency as (typeof CURRENCY_PRESETS)[number])

  return (
    <div className={`flex flex-col gap-4 p-5 ${cardClass}`}>
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Preferences</h2>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Currency</span>
        {customCurrency || !isPreset ? (
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={4}
              value={profile.currency}
              onChange={(e) => void handleCurrencyChange(e.target.value)}
              className={`w-20 text-sm ${inputClass}`}
            />
            <button
              type="button"
              onClick={() => setCustomCurrency(false)}
              className={`px-3 py-2 text-xs ${secondaryButtonClass}`}
            >
              Choose from list
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {CURRENCY_PRESETS.map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => void handleCurrencyChange(symbol)}
                className={`w-12 py-1.5 text-sm ${
                  profile.currency === symbol ? primaryButtonClass : secondaryButtonClass
                }`}
              >
                {symbol}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomCurrency(true)}
              className={`px-3 py-1.5 text-xs ${secondaryButtonClass}`}
            >
              Custom
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Odds format
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleOddsFormatChange('decimal')}
            className={`flex-1 py-1.5 text-sm ${
              profile.odds_format === 'decimal' ? primaryButtonClass : secondaryButtonClass
            }`}
          >
            Decimal
          </button>
          <button
            type="button"
            onClick={() => void handleOddsFormatChange('american')}
            className={`flex-1 py-1.5 text-sm ${
              profile.odds_format === 'american' ? primaryButtonClass : secondaryButtonClass
            }`}
          >
            American
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Date format
        </span>
        <div className="flex gap-2">
          {DATE_FORMATS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => void handleDateFormatChange(value)}
              className={`flex-1 py-1.5 text-xs ${
                profile.date_format === value ? primaryButtonClass : secondaryButtonClass
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
