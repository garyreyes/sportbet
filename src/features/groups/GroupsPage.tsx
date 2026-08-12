import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cardClass, focusRingOnSurface, inputClass } from '../../shared/styles'
import { useAuth } from '../auth/useAuth'
import { getUserGroups } from './api'
import { GroupDetail } from './GroupDetail'
import { InviteJoinPrompt } from './InviteJoinPrompt'
import { JoinCreateCard } from './JoinCreateCard'
import type { GroupWithMembers } from './types'

export function GroupsPage() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [searchParams, setSearchParams] = useSearchParams()
  const [inviteCode, setInviteCode] = useState(searchParams.get('invite'))
  const [groups, setGroups] = useState<GroupWithMembers[] | null>(null)
  const [groupsError, setGroupsError] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
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

  useEffect(() => {
    if (!groups) return
    if (!groups.some((g) => g.id === selectedGroupId)) {
      setSelectedGroupId(groups[0]?.id ?? null)
    }
  }, [groups, selectedGroupId])

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

  const selectedGroup = groups?.find((g) => g.id === selectedGroupId) ?? null

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

      {groupsError && <p className={`p-5 text-sm text-red-400 ${cardClass}`}>{groupsError}</p>}

      {!groupsError && groups === null && (
        <p className={`p-5 text-sm text-slate-500 ${cardClass}`}>Loading your groups…</p>
      )}

      {!groupsError && groups !== null && groups.length === 0 && (
        <p className={`p-5 text-sm text-slate-500 ${cardClass}`}>
          You haven't joined or created a group yet.
        </p>
      )}

      {!groupsError && groups !== null && groups.length > 0 && (
        <>
          {groups.length > 1 && (
            <select
              value={selectedGroupId ?? ''}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className={`text-sm ${inputClass} ${focusRingOnSurface}`}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          )}
          {selectedGroup && (
            <GroupDetail
              group={selectedGroup}
              currentUserId={userId}
              refreshKey={refreshKey}
              onChanged={() => setRefreshKey((k) => k + 1)}
            />
          )}
        </>
      )}
    </div>
  )
}
