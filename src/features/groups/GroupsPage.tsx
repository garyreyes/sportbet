import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getUserGroups } from './api'
import { InviteJoinPrompt } from './InviteJoinPrompt'
import { JoinCreateCard } from './JoinCreateCard'
import { Leaderboard } from './Leaderboard'
import type { GroupWithMembers } from './types'
import { YourGroupsList } from './YourGroupsList'

export function GroupsPage() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [searchParams, setSearchParams] = useSearchParams()
  const [inviteCode, setInviteCode] = useState(searchParams.get('invite'))
  const [groups, setGroups] = useState<GroupWithMembers[] | null>(null)
  const [groupsError, setGroupsError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setGroupsError(null)
    getUserGroups(userId)
      .then((result) => {
        if (!cancelled) setGroups(result)
      })
      .catch((err) => {
        if (!cancelled) setGroupsError(err instanceof Error ? err.message : 'Could not load your groups.')
      })
    return () => {
      cancelled = true
    }
  }, [userId, refreshKey])

  const clearInvite = () => {
    setInviteCode(null)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('invite')
      return next
    })
  }

  const handleJoined = () => {
    clearInvite()
    setRefreshKey((k) => k + 1)
  }

  if (!userId) return null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-8 sm:p-6">
      {inviteCode && (
        <InviteJoinPrompt inviteCode={inviteCode} onJoined={handleJoined} onDismiss={clearInvite} />
      )}
      {groups !== null && (
        <JoinCreateCard
          userId={userId}
          defaultExpanded={groups.length === 0}
          onJoined={() => setRefreshKey((k) => k + 1)}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}
      <YourGroupsList
        userId={userId}
        groups={groups}
        error={groupsError}
        onChanged={() => setRefreshKey((k) => k + 1)}
      />
      {groups !== null && groups.length > 0 && (
        <Leaderboard currentUserId={userId} groups={groups} refreshKey={refreshKey} />
      )}
    </div>
  )
}
