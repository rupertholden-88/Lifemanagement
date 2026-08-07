import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button, Segmented, TextInput } from '../shared/ui'

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
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink">Life Management</h1>
          <p className="mt-1.5 text-sm text-neutral-600">Fitness, meals &amp; household inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="border-t-2 border-ink pt-6">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mb-4 flex min-h-11 w-full items-center justify-center gap-2.5 rounded-full border-2 border-divider bg-transparent py-2.5 text-sm font-semibold text-ink transition hover:bg-neutral-100 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          <div className="mb-4 flex items-center gap-3 text-xs text-neutral-500">
            <span className="h-px flex-1 bg-neutral-300" />
            or with email
            <span className="h-px flex-1 bg-neutral-300" />
          </div>

          <Segmented
            options={[
              { id: 'signin' as const, label: 'Sign in' },
              { id: 'signup' as const, label: 'Create account' },
            ]}
            value={mode}
            onChange={setMode}
            className="mb-5"
          />

          <label className="mb-3 block text-sm">
            <span className="mb-1.5 block font-medium text-neutral-700">Email</span>
            <TextInput
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="mb-4 block text-sm">
            <span className="mb-1.5 block font-medium text-neutral-700">Password</span>
            <TextInput
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </label>

          {error && <p className="mb-4 rounded-full bg-accent-100 px-4 py-2.5 text-sm text-accent-800">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500">Your data syncs across every device you sign in on.</p>
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
