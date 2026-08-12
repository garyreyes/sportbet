import { useEffect, useState } from 'react'
import { cardClass } from '../../shared/styles'
import { getUserGroups } from './api'
import { GroupCard } from './GroupCard'
import type { GroupWithMembers } from './types'

interface YourGroupsListProps {
  userId: string
  refreshKey: number
  onChanged: () => void
}

export function YourGroupsList({ userId, refreshKey, onChanged }: YourGroupsListProps) {
  const [groups, setGroups] = useState<GroupWithMembers[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    getUserGroups(userId)
      .then((result) => {
        if (!cancelled) setGroups(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your groups.')
      })
    return () => {
      cancelled = true
    }
  }, [userId, refreshKey])

  if (error) {
    return <p className={`p-5 text-sm text-red-400 ${cardClass}`}>{error}</p>
  }

  if (groups === null) {
    return <p className={`p-5 text-sm text-slate-500 ${cardClass}`}>Loading your groups…</p>
  }

  if (groups.length === 0) {
    return (
      <p className={`p-5 text-sm text-slate-500 ${cardClass}`}>
        You haven't joined or created a group yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          currentUserId={userId}
          defaultExpanded={groups.length === 1}
          onChanged={onChanged}
        />
      ))}
    </div>
  )
}
