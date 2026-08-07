import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { FitnessProvider } from './context/FitnessContext'
import { MealsProvider } from './context/MealsContext'
import { RecipesProvider } from './context/RecipesContext'
import { InventoryProvider } from './context/InventoryContext'
import { LoginScreen } from './components/auth/LoginScreen'
import { AppShell } from './components/shared/AppShell'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Section } from './components/shared/nav'

function AuthGate() {
  const { status, localMode } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
      </div>
    )
  }

  if (status === 'signed-out' && !localMode) {
    return <LoginScreen />
  }

  return (
    <SettingsProvider>
      <FitnessProvider>
        <MealsProvider>
          <RecipesProvider>
            <InventoryProvider>
              <MainApp />
            </InventoryProvider>
          </RecipesProvider>
        </MealsProvider>
      </FitnessProvider>
    </SettingsProvider>
  )
}

function MainApp() {
  const [section, setSection] = useLocalStorage<Section>('hb.ui.section', 'dashboard')
  return <AppShell section={section} onSectionChange={setSection} />
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

export default App
