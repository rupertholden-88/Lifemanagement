import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'

export function LoginScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleGoogle = async () => {
    setError(null)
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? friendlyError(err.message) : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

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
          <h1 className="font-display text-3xl font-semibold text-white">Life Management</h1>
          <p className="mt-1 text-sm text-slate-400">Fitness, meals & household inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          <div className="mb-4 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or with email
            <span className="h-px flex-1 bg-slate-200" />
          </div>

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
  if (message.includes('auth/popup-closed-by-user') || message.includes('auth/cancelled-popup-request')) {
    return 'Google sign-in was cancelled — try again.'
  }
  if (message.includes('auth/popup-blocked')) {
    return 'Your browser blocked the Google sign-in popup — allow popups for this site and try again.'
  }
  if (message.includes('auth/account-exists-with-different-credential')) {
    return 'An account already exists for this email with a different sign-in method — try email and password.'
  }
  return message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim()
}
