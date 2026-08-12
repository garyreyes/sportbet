import { useAuth } from './useAuth'

export function AuthScreen() {
  const { signInWithGoogle, signInWithGithub } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-950 px-6 text-slate-100">
      <h1 className="text-3xl font-semibold tracking-tight">Bet Tracker</h1>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          onClick={signInWithGoogle}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 font-medium text-slate-900 shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={signInWithGithub}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 font-medium text-white shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Continue with GitHub
        </button>
      </div>
    </main>
  )
}
