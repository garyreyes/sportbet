import { MIN_LEGS, SPORTS, SPORT_LEAGUES, emptyLeg, type Leg } from './types'

interface LegEditorProps {
  legs: Leg[]
  onChange: (legs: Leg[]) => void
}

export function LegEditor({ legs, onChange }: LegEditorProps) {
  const updateLeg = (index: number, patch: Partial<Leg>) => {
    onChange(
      legs.map((leg, i) => {
        if (i !== index) return leg
        const next = { ...leg, ...patch }
        if (patch.sport && patch.sport !== leg.sport) {
          next.league = SPORT_LEAGUES[patch.sport][0]
        }
        return next
      }),
    )
  }

  const addLeg = () => onChange([...legs, emptyLeg()])
  const removeLeg = (index: number) => onChange(legs.filter((_, i) => i !== index))

  return (
    <div className="flex flex-col gap-3">
      {legs.map((leg, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-md border border-slate-800 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Leg {index + 1}</span>
            {legs.length > MIN_LEGS && (
              <button
                type="button"
                onClick={() => removeLeg(index)}
                className="text-xs text-red-400"
              >
                Remove
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={leg.sport}
              onChange={(e) => updateLeg(index, { sport: e.target.value })}
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
            >
              {SPORTS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
            <select
              value={leg.league}
              onChange={(e) => updateLeg(index, { league: e.target.value })}
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
            >
              {SPORT_LEAGUES[leg.sport].map((league) => (
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
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addLeg}
        className="rounded-md border border-slate-700 py-1 text-sm text-slate-300"
      >
        + Add leg
      </button>
    </div>
  )
}
