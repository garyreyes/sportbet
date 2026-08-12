import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getGroupCount } from './api'
import { InviteJoinPrompt } from './InviteJoinPrompt'
import { JoinCreateCard } from './JoinCreateCard'
import { YourGroupsList } from './YourGroupsList'

export function GroupsPage() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [searchParams, setSearchParams] = useSearchParams()
  const [inviteCode, setInviteCode] = useState(searchParams.get('invite'))
  const [groupCount, setGroupCount] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    getGroupCount(userId).then((count) => {
      if (!cancelled) setGroupCount(count)
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
      {groupCount !== null && (
        <JoinCreateCard
          userId={userId}
          defaultExpanded={groupCount === 0}
          onJoined={() => setRefreshKey((k) => k + 1)}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}
      <YourGroupsList
        userId={userId}
        refreshKey={refreshKey}
        onChanged={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
