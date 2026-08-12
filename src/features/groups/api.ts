import { supabase } from '../../lib/supabaseClient'
import type { Group, GroupPreview, GroupWithMembers, LeaderboardRow } from './types'

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

/**
 * group_members references auth.users, not profiles, so PostgREST can't embed
 * profiles directly off group_members — fetched separately and merged here
 * instead of relying on an implicit join that doesn't exist.
 */
export async function getUserGroups(userId: string): Promise<GroupWithMembers[]> {
  const fail = (error: unknown): never => {
    console.error('getUserGroups failed:', error)
    throw new Error('Could not load your groups. Please try again.')
  }

  const { data: memberships, error: membershipError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)
  if (membershipError) fail(membershipError)

  const groupIds = [...new Set((memberships ?? []).map((m) => m.group_id))]
  if (groupIds.length === 0) return []

  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)
  if (groupsError || !groups) fail(groupsError)

  const { data: allMembers, error: membersError } = await supabase
    .from('group_members')
    .select('group_id, user_id')
    .in('group_id', groupIds)
  if (membersError || !allMembers) fail(membersError)

  const memberUserIds = [...new Set((allMembers ?? []).map((m) => m.user_id))]
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', memberUserIds)
  if (profilesError || !profiles) fail(profilesError)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return (groups as Group[])
    .map((group) => ({
      ...group,
      isOwner: group.owner_id === userId,
      members: (allMembers ?? [])
        .filter((m) => m.group_id === group.id)
        .map((m) => ({
          user_id: m.user_id,
          full_name: profileMap.get(m.user_id)?.full_name ?? null,
          avatar_url: profileMap.get(m.user_id)?.avatar_url ?? null,
          is_owner: m.user_id === group.owner_id,
        })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function renameGroup(groupId: string, name: string): Promise<void> {
  const { error } = await supabase.from('groups').update({ name }).eq('id', groupId)

  if (error) {
    console.error('renameGroup failed:', error)
    throw new Error('Could not rename that group. Please try again.')
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await supabase.from('groups').delete().eq('id', groupId)

  if (error) {
    console.error('deleteGroup failed:', error)
    throw new Error('Could not delete that group. Please try again.')
  }
}

/** Shared by both kick (owner removing someone else) and leave (member removing self) — RLS alone decides which is actually permitted. */
export async function removeMember(groupId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) {
    console.error('removeMember failed:', error)
    throw new Error('Could not remove that member. Please try again.')
  }
}

/** Privacy toggles are already applied server-side — hidden stats come back null, no client-side hiding needed. */
export async function getGroupLeaderboard(groupId: string): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc('get_group_leaderboard', { p_group_id: groupId })

  if (error || !data) {
    console.error('getGroupLeaderboard failed:', error)
    throw new Error('Could not load the leaderboard. Please try again.')
  }

  return data
}
