import type { Session } from '@supabase/supabase-js'
import { createContext } from 'react'

export interface AuthContextValue {
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
