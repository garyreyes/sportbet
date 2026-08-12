export type OddsFormat = 'decimal' | 'american'
export type DateFormat = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY'

export interface MyProfile {
  full_name: string | null
  avatar_url: string | null
  currency: string
  odds_format: OddsFormat
  date_format: DateFormat
}

export const CURRENCY_PRESETS = ['$', '€', '£', '¥', '₱', '₹', 'A$', 'C$'] as const

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
