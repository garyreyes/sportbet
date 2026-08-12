import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { Bet } from '../types/bet'

export interface BetsContextValue {
  bets: Bet[]
  setBets: Dispatch<SetStateAction<Bet[]>>
  loading: boolean
  error: string | null
}

export const BetsContext = createContext<BetsContextValue | null>(null)
