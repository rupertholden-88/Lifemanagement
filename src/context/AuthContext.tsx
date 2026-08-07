import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth, firebaseEnabled } from '../lib/firebase'

type AuthStatus = 'loading' | 'signed-out' | 'signed-in'

interface AuthContextValue {
  uid: string | null
  email: string | null
  status: AuthStatus
  /** True when no Firebase project is configured — app runs single-device, no login required. */
  localMode: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(firebaseEnabled ? 'loading' : 'signed-in')

  useEffect(() => {
    if (!firebaseEnabled || !auth) return
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setStatus(u ? 'signed-in' : 'signed-out')
    })
    return unsub
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase is not configured')
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase is not configured')
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signOutUser = async () => {
    if (!auth) return
    await firebaseSignOut(auth)
  }

  const value: AuthContextValue = {
    uid: firebaseEnabled ? user?.uid ?? null : 'local',
    email: firebaseEnabled ? user?.email ?? null : null,
    status,
    localMode: !firebaseEnabled,
    signIn,
    signUp,
    signOutUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
