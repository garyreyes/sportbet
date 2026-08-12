import { supabase } from '../../lib/supabaseClient'
import type { Group, GroupPreview } from './types'

/** Owner is added to group_members by the handle_new_group trigger — no client insert needed. */
export async function createGroup(userId: string, name: string): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .insert({ name, owner_id: userId })
    .select()
    .single()

  if (error || !data) {
    console.error('createGroup failed:', error)
    throw new Error('Could not create that group. Please try again.')
  }

  return data
}

/** Name-only preview so the Join flow can show what the user is about to join, without the RLS membership check that blocks a plain SELECT. */
export async function getGroupPreview(inviteCode: string): Promise<GroupPreview> {
  const { data, error } = await supabase.rpc('get_group_preview_by_invite_code', {
    p_invite_code: inviteCode,
  })

  if (error || !data || data.length === 0) {
    console.error('getGroupPreview failed:', error)
    throw new Error('That invite code doesn’t match a group.')
  }

  return data[0]
}

export async function joinGroupByInviteCode(inviteCode: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_group_by_invite_code', {
    p_invite_code: inviteCode,
  })

  if (error || !data) {
    console.error('joinGroupByInviteCode failed:', error)
    throw new Error('Could not join that group. Please try again.')
  }

  return data
}

/** Used only to decide the Join/Create card's default expanded/collapsed state. */
export async function getGroupCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('group_members')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('getGroupCount failed:', error)
    return 0
  }

  return count ?? 0
}
