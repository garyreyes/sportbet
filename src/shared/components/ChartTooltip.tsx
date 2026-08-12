import type { TooltipContentProps } from 'recharts'

// recharts v3's TooltipContentProps generics don't unify cleanly across different chart shapes; `any` avoids fighting that here.
export function ChartTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<any, any>) {
  if (!active || !payload || payload.length === 0) return null
  const value = payload[0].value as number
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs shadow-lg shadow-black/30">
      <p className="text-slate-400">{label}</p>
      <p className={`font-semibold ${value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {value.toFixed(2)}
      </p>
    </div>
  )
}
