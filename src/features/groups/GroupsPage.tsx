import { useSearchParams } from 'react-router-dom'

export function GroupsPage() {
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite')

  return (
    <div className="p-4">
      <p>Groups — coming soon.</p>
      {inviteCode && (
        <p className="mt-2 text-sm text-slate-400">
          Invite code detected ({inviteCode}) — auto-join will be wired up
          when the Groups feature is built.
        </p>
      )}
    </div>
  )
}
