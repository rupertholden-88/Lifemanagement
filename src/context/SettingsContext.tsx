import { createContext, useContext, type ReactNode } from 'react'
import { useSyncedList } from '../hooks/useSyncedList'
import { useAuth } from './AuthContext'
import type { DayOfWeek } from '../types'

interface SettingsDoc {
  id: 'settings'
  wfhDay: DayOfWeek
  /** Overrides the sign-in provider's name in greetings — set by the user, works in every auth mode. */
  displayName?: string
}

const DEFAULTS: SettingsDoc = { id: 'settings', wfhDay: 'Wednesday' }

interface SettingsContextValue {
  wfhDay: DayOfWeek
  setWfhDay: (day: DayOfWeek) => void
  displayName: string
  setDisplayName: (name: string) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth()
  const { items, set } = useSyncedList<SettingsDoc>('hb.settings', 'settings', uid, [DEFAULTS])

  const settings = items.find((s) => s.id === 'settings') ?? DEFAULTS

  const setWfhDay = (day: DayOfWeek) => {
    set({ ...settings, wfhDay: day })
  }

  const setDisplayName = (name: string) => {
    set({ ...settings, displayName: name.trim() })
  }

  return (
    <SettingsContext.Provider
      value={{ wfhDay: settings.wfhDay, setWfhDay, displayName: settings.displayName ?? '', setDisplayName }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
