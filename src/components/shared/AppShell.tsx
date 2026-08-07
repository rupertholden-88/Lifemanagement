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
    <div className="min-h-screen bg-paper-50 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-navy-900 bg-gradient-to-b from-navy-950 to-navy-900 px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <span className="font-display text-xl font-semibold text-white">Life Management</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                section === item.id
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/10 pt-4 text-xs text-slate-400">
          {localMode ? (
            <p>Local-only mode — data stays on this device.</p>
          ) : (
            <div className="space-y-2">
              <p className="truncate text-slate-300">{email}</p>
              <button
                onClick={() => signOutUser()}
                className="rounded-md bg-white/5 px-2.5 py-1.5 text-slate-200 transition hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-paper-200 bg-paper-50/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-display text-lg font-semibold text-navy-900">Life Management</span>
        {!localMode && (
          <button onClick={() => signOutUser()} className="text-sm font-medium text-teal-700">
            Sign out
          </button>
        )}
      </header>

      <main className="flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pb-10 sm:pt-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-5xl">
          <SectionContent section={section} onNavigate={onSectionChange} />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-paper-200 bg-white/95 backdrop-blur lg:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
              section === item.id ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
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
