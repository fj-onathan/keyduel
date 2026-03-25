import { Link } from 'react-router-dom'
import { Modal } from '../ui/Modal'
import { useUIStore } from '../../store/uiStore'
import { env } from '../../config/env'

const GUEST_ID_KEY = 'keyduel_guest_id'

function getGuestId(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(GUEST_ID_KEY) ?? ''
}

export function AuthModal() {
  const isOpen = useUIStore((s) => s.isAuthModalOpen)
  const close = useUIStore((s) => s.closeAuthModal)

  const handleGitHubLogin = () => {
    const guestId = getGuestId()
    const params = new URLSearchParams()
    if (guestId) params.set('guest_id', guestId)
    const qs = params.toString()
    window.location.href = `${env.apiBaseUrl}/auth/github${qs ? `?${qs}` : ''}`
  }

  return (
    <Modal open={isOpen} onClose={close} title="Sign in to KeyDuel">
      <div className="auth-modal-content">
        <p className="auth-modal-subtitle">
          Sign in to save your race history, track your stats across devices,
          and appear on the leaderboard with your real identity.
        </p>

        <button
          type="button"
          className="auth-github-btn"
          onClick={handleGitHubLogin}
        >
          <svg
            className="auth-github-icon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        <p className="auth-modal-terms">
          By signing in, you agree to our{' '}
          <Link to="/terms" onClick={close}>Terms of Service</Link> and{' '}
          <Link to="/privacy" onClick={close}>Privacy Policy</Link>.
        </p>
      </div>
    </Modal>
  )
}
