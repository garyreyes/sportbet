/**
 * Flags a panel's data scope when it diverges from the page's shared time-range
 * tabs (e.g. Monte Carlo, AI Coach) — a colored pill reads faster than caption
 * text alone, and gives every "this control works differently" panel one shared
 * visual idiom instead of each reinventing its own disclosure note.
 */
export function ScopeBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      {children}
    </span>
  )
}
