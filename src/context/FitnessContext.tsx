import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useSyncedList } from '../hooks/useSyncedList'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from './AuthContext'
import { QUALITY_RUN_ROTATION } from '../data/fitnessPlan'
import type { ExerciseLog, MetricEntry, QualityRunWeek } from '../types'

interface LogSessionInput {
  sessionId: string
  date: string
  completedExercises?: string[]
  durationMin?: number
  avgHr?: number
  distanceKm?: number
  notes?: string
  pointsEarned: number
}

interface FitnessContextValue {
  exerciseLogs: ExerciseLog[]
  metricEntries: MetricEntry[]
  planStartDate: string
  logSession: (input: LogSessionInput) => void
  removeLog: (logId: string) => void
  addMetricEntry: (entry: Omit<MetricEntry, 'id'>) => void
  removeMetricEntry: (id: string) => void
  currentQualityWeek: QualityRunWeek
}

const FitnessContext = createContext<FitnessContextValue | null>(null)

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

export function FitnessProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth()
  const { items: exerciseLogs, set: setLog, remove: removeLogItem } = useSyncedList<ExerciseLog>(
    'hb.fitness.logs',
    'fitnessLogs',
    uid,
    [],
  )
  const { items: metricEntries, set: setMetric, remove: removeMetricItem } = useSyncedList<MetricEntry>(
    'hb.fitness.metrics',
    'fitnessMetrics',
    uid,
    [],
  )
  const [planStartDate] = useLocalStorage<string>('hb.fitness.planStart', isoToday)

  const logSession = (input: LogSessionInput) => {
    const entry: ExerciseLog = {
      id: `${input.sessionId}-${input.date}`,
      sessionId: input.sessionId,
      date: input.date,
      completedExercises: input.completedExercises ?? [],
      durationMin: input.durationMin,
      avgHr: input.avgHr,
      distanceKm: input.distanceKm,
      notes: input.notes,
      pointsEarned: input.pointsEarned,
    }
    setLog(entry)
  }

  const removeLog = (logId: string) => removeLogItem(logId)

  const addMetricEntry = (entry: Omit<MetricEntry, 'id'>) => {
    setMetric({ ...entry, id: `metric-${Date.now()}` })
  }

  const removeMetricEntry = (id: string) => removeMetricItem(id)

  const currentQualityWeek = useMemo(() => {
    const start = new Date(planStartDate)
    const now = new Date()
    const daysSince = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000))
    const weekIndex = Math.floor(daysSince / 7) % QUALITY_RUN_ROTATION.length
    return QUALITY_RUN_ROTATION[weekIndex]
  }, [planStartDate])

  const value: FitnessContextValue = {
    exerciseLogs,
    metricEntries,
    planStartDate,
    logSession,
    removeLog,
    addMetricEntry,
    removeMetricEntry,
    currentQualityWeek,
  }

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>
}

export function useFitness() {
  const ctx = useContext(FitnessContext)
  if (!ctx) throw new Error('useFitness must be used within FitnessProvider')
  return ctx
}
