import type { ReactNode } from 'react'
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

export function AppShell({ section, onSectionChange }: AppShellProps) {
  const { email, localMode, signOutUser } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper text-ink">
      <header className="sticky top-0 z-20 flex w-full max-w-[560px] items-center justify-between border-b-2 border-divider bg-paper/95 px-5 py-3 backdrop-blur">
        <span className="font-heading text-[15px] font-semibold tracking-[-0.01em]">Life Management</span>
        {!localMode && (
          <button onClick={() => signOutUser()} className="font-heading text-[13px] font-semibold text-accent-700">
            Sign out
          </button>
        )}
        {localMode && <span className="text-xs text-neutral-500">Local-only</span>}
      </header>

      <main className="w-full max-w-[560px] flex-1 px-5 pt-5 pb-28">
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
