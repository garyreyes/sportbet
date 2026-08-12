import { useAuth } from './useAuth'

export function AuthScreen() {
  const { signInWithGoogle, signInWithGithub } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-6 text-slate-100">
      <h1 className="text-2xl font-semibold">Bet Tracker</h1>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={signInWithGoogle}
          className="flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 font-medium text-slate-900 hover:bg-slate-100"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={signInWithGithub}
          className="flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 font-medium text-white hover:bg-slate-900"
        >
          Continue with GitHub
        </button>
      </div>
    </main>
  )
}
