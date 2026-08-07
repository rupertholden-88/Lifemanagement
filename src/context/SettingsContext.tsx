import { createContext, useContext, type ReactNode } from 'react'
import { useSyncedList } from '../hooks/useSyncedList'
import { useAuth } from './AuthContext'
import type { DayOfWeek } from '../types'

interface SettingsDoc {
  id: 'settings'
  wfhDay: DayOfWeek
}

const DEFAULTS: SettingsDoc = { id: 'settings', wfhDay: 'Wednesday' }

interface SettingsContextValue {
  wfhDay: DayOfWeek
  setWfhDay: (day: DayOfWeek) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth()
  const { items, set } = useSyncedList<SettingsDoc>('hb.settings', 'settings', uid, [DEFAULTS])

  const settings = items.find((s) => s.id === 'settings') ?? DEFAULTS

  const setWfhDay = (day: DayOfWeek) => {
    set({ ...settings, wfhDay: day })
  }

  return (
    <SettingsContext.Provider value={{ wfhDay: settings.wfhDay, setWfhDay }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
