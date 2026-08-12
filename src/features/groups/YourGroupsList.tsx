import { cardClass } from '../../shared/styles'
import { GroupCard } from './GroupCard'
import type { GroupWithMembers } from './types'

interface YourGroupsListProps {
  userId: string
  groups: GroupWithMembers[] | null
  error: string | null
  onChanged: () => void
}

export function YourGroupsList({ userId, groups, error, onChanged }: YourGroupsListProps) {
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
