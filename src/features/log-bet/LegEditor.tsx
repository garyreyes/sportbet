import { dangerButtonClass, inputClass, secondaryButtonClass } from '../../shared/styles'
import { MIN_LEGS, type Leg } from './types'

interface LegEditorProps {
  legs: Leg[]
  onChange: (legs: Leg[]) => void
  sportLeagues: Record<string, string[]>
}

export function LegEditor({ legs, onChange, sportLeagues }: LegEditorProps) {
  const sports = Object.keys(sportLeagues)

  const updateLeg = (index: number, patch: Partial<Leg>) => {
    onChange(
      legs.map((leg, i) => {
        if (i !== index) return leg
        const next = { ...leg, ...patch }
        if (patch.sport && patch.sport !== leg.sport) {
          next.league = sportLeagues[patch.sport][0]
        }
        return next
      }),
    )
  }

  const addLeg = () =>
    onChange([...legs, { sport: sports[0], league: sportLeagues[sports[0]][0], pick: '' }])
  const removeLeg = (index: number) => onChange(legs.filter((_, i) => i !== index))

  return (
    <div className="flex flex-col gap-3">
      {legs.map((leg, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Leg {index + 1}
            </span>
            {legs.length > MIN_LEGS && (
              <button
                type="button"
                onClick={() => removeLeg(index)}
                className={`rounded px-2 py-0.5 text-xs ${dangerButtonClass}`}
              >
                Remove
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={leg.sport}
              onChange={(e) => updateLeg(index, { sport: e.target.value })}
              className={`flex-1 text-sm ${inputClass}`}
            >
              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
            <select
              value={leg.league}
              onChange={(e) => updateLeg(index, { league: e.target.value })}
              className={`flex-1 text-sm ${inputClass}`}
            >
              {sportLeagues[leg.sport].map((league) => (
                <option key={league} value={league}>
                  {league}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={leg.pick}
            onChange={(e) => updateLeg(index, { pick: e.target.value })}
            placeholder="Pick (optional)"
            className={`text-sm ${inputClass}`}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addLeg}
        className={`py-1.5 text-sm ${secondaryButtonClass}`}
      >
        + Add leg
      </button>
    </div>
  )
}
