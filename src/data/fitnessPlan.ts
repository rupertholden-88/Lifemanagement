import type { DayOfWeek, FitnessSession, MetricTarget, QualityRunWeek } from '../types'

export const FITNESS_SESSIONS: FitnessSession[] = [
  {
    id: 'mon-easy-run',
    day: 'Monday',
    type: 'run-easy',
    title: 'Easy run (office lunchtime)',
    duration: '25–30 min',
    detail: 'Conversational pace, HR under ~145 bpm. It should feel too slow.',
    points: 10,
  },
  {
    id: 'tue-strength-a',
    day: 'Tuesday',
    type: 'strength',
    title: 'Strength A (home, evening)',
    duration: '20–25 min',
    detail: 'Bodyweight circuit, 3 rounds. Rest 60–90s between rounds. Move briskly between exercises.',
    points: 15,
    rounds: 3,
    restBetweenRounds: '60–90 s',
    exercises: [
      { name: 'Bodyweight squats', reps: '15', cue: 'Chest up, sit back, full depth if knees allow' },
      { name: 'Press-ups', reps: '10–15', cue: 'Body in a straight line; drop to knees to finish reps if needed' },
      { name: 'Reverse lunges', reps: '10 / leg', cue: 'Step back, knee brushes floor, drive up through front heel' },
      { name: 'Bent-over row (bag/dumbbell)', reps: '12', cue: 'Flat back, pull elbow to hip — a loaded rucksack works fine' },
      { name: 'Glute bridges', reps: '15', cue: "Squeeze at the top, don't arch the lower back" },
      { name: 'Plank', reps: '30–45 s', cue: "Brace abs, don't let hips sag" },
    ],
  },
  {
    id: 'wed-strength-b',
    day: 'Wednesday',
    type: 'strength',
    title: 'Strength B (WFH day)',
    duration: '30–40 min',
    detail: 'Longer session with the extra flexibility, 4 rounds. Add load where you can. Swap for an easy run if preferred.',
    points: 20,
    rounds: 4,
    restBetweenRounds: '90 s',
    exercises: [
      { name: 'Goblet squats', reps: '12', cue: 'Hold weight at chest; slow 3-second descent' },
      { name: 'Press-ups (feet elevated if easy)', reps: '12–15', cue: 'Elevate feet on stairs/sofa to progress' },
      { name: 'Split squats', reps: '10 / leg', cue: 'Rear foot on a step; torso tall — great for stairs-with-toddler strength' },
      { name: 'Single-arm rows', reps: '12 / arm', cue: 'Hand on chair, flat back, full stretch at the bottom' },
      { name: 'Overhead press', reps: '10', cue: 'Brace glutes and abs — no leaning back. Mirrors lifting a child overhead' },
      { name: 'Dead bugs', reps: '10 / side', cue: 'Lower back pressed into the floor throughout' },
      { name: "Farmer's carry", reps: '40 s', cue: 'Heavy in each hand, walk tall — the most "parent-life" exercise there is' },
    ],
  },
  {
    id: 'thu-easy-run',
    day: 'Thursday',
    type: 'run-easy',
    title: 'Easy run (office lunchtime)',
    duration: '25–30 min',
    detail: 'Same rules as Monday. Keep it genuinely easy.',
    points: 10,
  },
  {
    id: 'fri-rest',
    day: 'Friday',
    type: 'rest',
    title: 'Rest',
    duration: '—',
    detail: 'Full rest. Recovery is where fitness is actually built.',
    points: 0,
  },
  {
    id: 'sat-quality-run',
    day: 'Saturday',
    type: 'run-quality',
    title: 'Quality run',
    duration: '35–45 min',
    detail: 'The one hard session — intervals, tempo, or a hilly 5–7 km. Peak zone allowed here. Rotates weekly, see below.',
    points: 25,
  },
  {
    id: 'sun-active-recovery',
    day: 'Sunday',
    type: 'active-recovery',
    title: 'Active recovery',
    duration: 'Flexible',
    detail: 'Family walk, buggy push, easy bike. Nothing structured.',
    points: 5,
  },
]

export const QUALITY_RUN_ROTATION: QualityRunWeek[] = [
  {
    week: 1,
    title: 'Intervals',
    detail: '10 min easy warm-up · 5 × 3 min hard (HR 160+) with 2 min easy jog between · 5 min cool-down',
  },
  {
    week: 2,
    title: 'Tempo',
    detail: '10 min easy · 15–20 min comfortably hard (HR ~150–160) · 5–10 min easy',
  },
  {
    week: 3,
    title: 'Long easy run',
    detail: '45–60 min entirely conversational — extend distance, not pace',
  },
  {
    week: 4,
    title: '5K effort',
    detail: 'Run your usual route at a strong but controlled effort — this is your progress benchmark',
  },
]

export const HEART_RATE_ZONES = [
  { zone: 'Easy / aerobic', range: '115–145 bpm', feels: 'Can hold a conversation', usedFor: 'Most runs — base building, fat burning' },
  { zone: 'Moderate / tempo', range: '145–160 bpm', feels: 'Short sentences only', usedFor: 'Occasional tempo blocks' },
  { zone: 'Hard / peak', range: '160+ bpm', feels: 'A few words at most', usedFor: 'Saturday session only' },
]

export const METRIC_TARGETS: MetricTarget[] = [
  { key: 'restingHr', label: 'Resting heart rate', unit: 'bpm', start: 90, target: 70, lowerIsBetter: true },
  { key: 'weight', label: 'Weight', unit: 'kg', start: 80.65, target: 75.5, lowerIsBetter: true },
  { key: 'bodyFat', label: 'Body fat', unit: '%', start: 19.6, target: 16.5, lowerIsBetter: true },
  { key: 'fiveKMinutes', label: '5K time', unit: 'min', start: 35, target: 30, lowerIsBetter: true },
]

export const FITNESS_RULES = [
  "Easy means easy. If you can't chat, you're going too fast. This is the rule everyone breaks.",
  'One hard session a week. Saturday only. More isn\'t better on toddler sleep.',
  "Never miss two in a row. Life with a young child will wreck some sessions — fine. Just don't skip the next one.",
  'Strength is non-negotiable. Twice a week protects muscle in a deficit and does more for carrying, lifting and floor play than running does.',
  'Judge by the month, not the day. Weekly weight average, resting HR trend, and how the stairs feel.',
]

export const WEEKLY_MAX_POINTS = FITNESS_SESSIONS.reduce((sum, s) => sum + s.points, 0)

/**
 * The plan with Strength B moved to the user's actual WFH day. The session that
 * normally occupies that day swaps back to Wednesday, so the week always keeps
 * the same seven sessions.
 */
export function scheduleForWfhDay(wfhDay: DayOfWeek): FitnessSession[] {
  if (wfhDay === 'Wednesday') return FITNESS_SESSIONS
  return FITNESS_SESSIONS.map((session) => {
    if (session.id === 'wed-strength-b') return { ...session, day: wfhDay }
    if (session.day === wfhDay) return { ...session, day: 'Wednesday' as DayOfWeek }
    return session
  })
}
