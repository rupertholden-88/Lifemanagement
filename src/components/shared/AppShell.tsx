import { useEffect, useRef, type ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { NAV_ITEMS, type Section } from './nav'
import { Dashboard } from '../dashboard/Dashboard'
import { FitnessTab } from '../fitness/FitnessTab'
import { MealsTab } from '../meals/MealsTab'
import { RecipesTab } from '../recipes/RecipesTab'
import { InventoryTab } from '../inventory/InventoryTab'

interface AppShellProps {
  section: Section
  onSectionChange: (section: Section) => void
}

/** Travel before a touch commits to a direction — short enough to feel immediate, long enough to tell a scroll from a swipe. */
const DIRECTION_LOCK_PX = 10
/** Total horizontal travel required to actually switch tabs, once a swipe is underway. */
const SWIPE_MIN_PX = 60
const SWIPE_DIRECTION_RATIO = 1.5
/** Touches starting this close to the screen edge are left alone — mobile browsers reserve that zone for their own back/forward swipe gesture. */
const EDGE_EXCLUSION_PX = 24

/** Swipe left/right on the content area to move a tab, mirroring the bottom nav order. Runs on real (non-passive) touch
 * listeners rather than React's synthetic ones, because stopping the browser's own horizontal-overscroll "swipe back"
 * navigation requires calling preventDefault() on touchmove, which React's passive touch handlers can't do. */
function useSwipeNav(section: Section, onSectionChange: (section: Section) => void) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let start: { x: number; y: number } | null = null
    let locked: 'horizontal' | 'vertical' | null = null

    const onStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      const touch = e.touches[0]
      const outOfBounds = touch.clientX < EDGE_EXCLUSION_PX || touch.clientX > window.innerWidth - EDGE_EXCLUSION_PX
      if (target.closest('[data-swipe-block]') || outOfBounds) {
        start = null
        locked = null
        return
      }
      start = { x: touch.clientX, y: touch.clientY }
      locked = null
    }

    const onMove = (e: TouchEvent) => {
      if (!start) return
      const touch = e.touches[0]
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (locked === null) {
        if (Math.abs(dx) < DIRECTION_LOCK_PX && Math.abs(dy) < DIRECTION_LOCK_PX) return
        locked = Math.abs(dx) > Math.abs(dy) * SWIPE_DIRECTION_RATIO ? 'horizontal' : 'vertical'
      }
      if (locked === 'horizontal') e.preventDefault()
    }

    const onEnd = (e: TouchEvent) => {
      const wasHorizontal = locked === 'horizontal'
      const s = start
      start = null
      locked = null
      if (!wasHorizontal || !s) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - s.x
      if (Math.abs(dx) < SWIPE_MIN_PX) return

      const index = NAV_ITEMS.findIndex((item) => item.id === section)
      if (dx < 0 && index < NAV_ITEMS.length - 1) onSectionChange(NAV_ITEMS[index + 1].id)
      else if (dx > 0 && index > 0) onSectionChange(NAV_ITEMS[index - 1].id)
    }

    const onCancel = () => {
      start = null
      locked = null
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    el.addEventListener('touchcancel', onCancel, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onCancel)
    }
  }, [section, onSectionChange])

  return ref
}

export function AppShell({ section, onSectionChange }: AppShellProps) {
  const { email, localMode, signOutUser } = useAuth()
  const mainRef = useSwipeNav(section, onSectionChange)

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper text-ink">
      <header className="sticky top-0 z-20 flex w-full max-w-[560px] items-center justify-between border-b-2 border-divider bg-topbar/95 px-5 py-3 backdrop-blur">
        <span className="font-heading text-[15px] font-semibold tracking-[-0.01em]">Life Management</span>
        {!localMode && (
          <button onClick={() => signOutUser()} className="font-heading text-[13px] font-semibold text-accent-700">
            Sign out
          </button>
        )}
        {localMode && <span className="text-xs text-neutral-800">Local-only</span>}
      </header>

      <main ref={mainRef} className="w-full max-w-[560px] flex-1 px-5 pt-5 pb-28">
        <SectionContent section={section} onNavigate={onSectionChange} />
        {!localMode && email && (
          <p className="mt-10 truncate border-t-2 border-divider pt-3 text-xs text-neutral-500">{email}</p>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center border-t-2 border-ink bg-neutral-100">
        <div className="grid w-full max-w-[560px] grid-cols-5 gap-0.5 px-2 pt-2.5" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
          {NAV_ITEMS.map((item) => {
            const active = section === item.id
            const ItemIcon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex min-h-11 flex-col items-center gap-1 rounded-full py-2 font-heading text-[10.5px] font-semibold transition ${
                  active ? 'bg-accent text-white' : 'text-neutral-600 hover:text-ink'
                }`}
              >
                <ItemIcon width={21} height={21} />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function SectionContent({
  section,
  onNavigate,
}: {
  section: Section
  onNavigate: (section: Section) => void
}): ReactNode {
  switch (section) {
    case 'dashboard':
      return <Dashboard onNavigate={onNavigate} />
    case 'fitness':
      return <FitnessTab />
    case 'meals':
      return <MealsTab />
    case 'recipes':
      return <RecipesTab />
    case 'inventory':
      return <InventoryTab />
  }
}
