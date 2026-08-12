import { useEffect, useState } from 'react'

/**
 * Autosaves `value` to localStorage on every change, keyed per-user.
 * Loading merges the saved draft over `initial` so a draft saved before a
 * field existed doesn't silently omit it.
 */
export function useDraft<T extends object>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key)
    if (!saved) return initial
    try {
      return { ...initial, ...JSON.parse(saved) }
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  const clearDraft = () => {
    localStorage.removeItem(key)
    setValue(initial)
  }

  return [value, setValue, clearDraft] as const
}
