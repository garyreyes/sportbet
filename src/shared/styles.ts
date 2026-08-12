/**
 * Shared class tokens so card/button/focus treatment stays consistent
 * across features instead of drifting file to file. Real theming (5
 * themes, custom color derivation) lands in Phase 7b and will re-skin
 * colors on top of this structure, not replace it.
 */

/** For interactive elements sitting directly on the page background (slate-950). */
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

/** For interactive elements sitting on a card/modal/nav surface (slate-900) — the offset color must match what's actually behind the element, or the ring shows a mismatched notch. */
export const focusRingOnSurface =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'

export const cardClass = 'rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/20'

export const primaryButtonClass = `rounded-lg bg-emerald-600 font-medium text-white shadow-sm shadow-emerald-950/40 transition-colors hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 ${focusRingOnSurface}`

export const secondaryButtonClass = `rounded-lg bg-slate-800 text-slate-200 transition-colors hover:bg-slate-700 active:bg-slate-600 ${focusRingOnSurface}`

export const dangerButtonClass = `rounded-lg bg-red-900/40 text-red-300 transition-colors hover:bg-red-900/70 ${focusRingOnSurface}`

export const inputClass = `rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm transition-colors focus:border-emerald-500 ${focusRingOnSurface}`
