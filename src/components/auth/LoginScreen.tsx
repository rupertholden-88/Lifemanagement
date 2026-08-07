import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'

export function LoginScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? friendlyError(err.message) : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 text-2xl">
            🏠
          </div>
          <h1 className="text-2xl font-semibold text-white">Home Base</h1>
          <p className="mt-1 text-sm text-slate-400">Fitness, meals & household inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-5 flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-md py-1.5 transition ${
                mode === 'signin' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md py-1.5 transition ${
                mode === 'signup' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Create account
            </button>
          </div>

          <label className="mb-3 block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              placeholder="you@example.com"
            />
          </label>

          <label className="mb-4 block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              placeholder="At least 6 characters"
            />
          </label>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-teal-600 py-2.5 font-medium text-white transition hover:bg-teal-500 disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Your data syncs across every device you sign in on.
        </p>
      </div>
    </div>
  )
}

function friendlyError(message: string): string {
  if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
    return 'Incorrect email or password.'
  }
  if (message.includes('auth/user-not-found')) {
    return 'No account found for that email.'
  }
  if (message.includes('auth/email-already-in-use')) {
    return 'An account already exists for that email — try signing in instead.'
  }
  if (message.includes('auth/weak-password')) {
    return 'Password should be at least 6 characters.'
  }
  if (message.includes('auth/invalid-email')) {
    return 'That email address looks invalid.'
  }
  return message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim()
}
