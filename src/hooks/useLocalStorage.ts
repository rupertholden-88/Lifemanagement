import { useEffect, useRef, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) return JSON.parse(stored) as T
    } catch {
      // ignore corrupt storage, fall back to initial value
    }
    return initialValue instanceof Function ? initialValue() : initialValue
  })

  const firstRun = useRef(true)

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable — silently skip persistence
    }
  }, [key, value])

  return [value, setValue] as const
}
