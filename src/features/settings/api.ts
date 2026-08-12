import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES } from './types'
import type { DateFormat, MyProfile, OddsFormat } from './types'

const PROFILE_COLUMNS = 'full_name, avatar_url, currency, odds_format, date_format'

export function useMyProfile(userId: string) {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('useMyProfile fetch failed:', error)
        } else if (data) {
          setProfile(data)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return { profile, setProfile, loading }
}

export async function updateDisplayName(userId: string, fullName: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId)

  if (error) {
    console.error('updateDisplayName failed:', error)
    throw new Error('Could not save your display name. Please try again.')
  }
}

export async function updateCurrency(userId: string, currency: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ currency }).eq('id', userId)

  if (error) {
    console.error('updateCurrency failed:', error)
    throw new Error('Could not save your currency. Please try again.')
  }
}

export async function updateOddsFormat(userId: string, oddsFormat: OddsFormat): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ odds_format: oddsFormat })
    .eq('id', userId)

  if (error) {
    console.error('updateOddsFormat failed:', error)
    throw new Error('Could not save your odds format. Please try again.')
  }
}

export async function updateDateFormat(userId: string, dateFormat: DateFormat): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ date_format: dateFormat })
    .eq('id', userId)

  if (error) {
    console.error('updateDateFormat failed:', error)
    throw new Error('Could not save your date format. Please try again.')
  }
}

/**
 * Client-side type/size checks are just fast feedback — the avatars bucket
 * also enforces a MIME allowlist and 5MB cap server-side (Security Baseline
 * #16), so a bypassed client check still can't upload anything unsafe.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPEG, PNG, or WebP image.')
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('Image must be 5MB or smaller.')
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file)
  if (uploadError) {
    console.error('uploadAvatar upload failed:', uploadError)
    throw new Error('Could not upload that image. Please try again.')
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const avatarUrl = data.publicUrl

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  if (updateError) {
    console.error('uploadAvatar profile update failed:', updateError)
    throw new Error('Image uploaded, but could not save it to your profile. Please try again.')
  }

  return avatarUrl
}
