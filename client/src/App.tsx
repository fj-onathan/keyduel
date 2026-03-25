import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useSearchParams } from 'react-router-dom'
import { SiteFooter } from './components/layout/SiteFooter'
import { SiteHeader } from './components/layout/SiteHeader'
import { ToastContainer } from './components/ui/ToastContainer'
import { HubsPage } from './pages/HubsPage'
import { LandingPage } from './pages/LandingPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { DashboardPage } from './pages/DashboardPage'
import { RaceEntryPage } from './pages/RaceEntryPage'
import { RaceLobbyPage } from './pages/RaceLobbyPage'
import { RacePage } from './pages/RacePage'
import { RaceReplayPage } from './pages/RaceReplayPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { useAuthStore } from './store/authStore'
import { useToastStore } from './store/toastStore'

function AppLayout() {
  return (
    <>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
      <ToastContainer />
    </>
  )
}

function AuthInit() {
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const addToast = useToastStore((s) => s.addToast)
  const [searchParams, setSearchParams] = useSearchParams()

  // Hydrate auth state on mount.
  useEffect(() => {
    fetchMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle login callback from OAuth redirect.
  useEffect(() => {
    const loginStatus = searchParams.get('login')
    if (!loginStatus) return

    if (loginStatus === 'success') {
      // Wait until fetchMe resolves and isAuthenticated becomes true
      // before showing the toast and cleaning up URL params.
      if (!isAuthenticated) return
      addToast('Welcome back! You are now signed in.', 'success')
    } else if (loginStatus === 'error') {
      const message = searchParams.get('message') || 'Login failed. Please try again.'
      addToast(message, 'error', 5000)
    }

    // Clean up URL params only after we've handled the status.
    searchParams.delete('login')
    searchParams.delete('message')
    setSearchParams(searchParams, { replace: true })
  }, [isAuthenticated, searchParams, setSearchParams, addToast])

  return null
}

function App() {
  return (
    <Routes>
      <Route element={<><AuthInit /><AppLayout /></>}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hubs" element={<HubsPage />} />
        <Route path="/race" element={<RaceEntryPage />} />
        <Route path="/race/:hub/:raceId" element={<RacePage />} />
        <Route path="/race/:hub/:raceId/replay" element={<RaceReplayPage />} />
        <Route path="/race/:hub" element={<RaceLobbyPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/leaderboard/:hubSlug" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/u/:username" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
