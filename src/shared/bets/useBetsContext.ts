import { useContext } from 'react'
import { BetsContext } from './betsContextDef'

export function useBetsContext() {
  const context = useContext(BetsContext)
  if (!context) {
    throw new Error('useBetsContext must be used within a BetsProvider')
  }
  return context
}
