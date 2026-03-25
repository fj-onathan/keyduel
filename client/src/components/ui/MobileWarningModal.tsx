import { Modal } from './Modal'

export function MobileWarningModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title="Best on Desktop">
      <div className="mobile-warning-content">
        <div className="mobile-warning-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="8" width="40" height="26" rx="3" stroke="currentColor" strokeWidth="2.5" />
            <rect x="8" y="12" width="32" height="18" rx="1" fill="currentColor" opacity="0.1" />
            <path d="M16 38h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M20 34v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M28 34v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <p className="mobile-warning-message">
          KeyDuel is built around typing real code at speed — something that
          really shines with a physical keyboard.
        </p>
        <p className="mobile-warning-suggestion">
          For the best experience, hop on a desktop or laptop. Your fingers will
          thank you!
        </p>

        <button
          type="button"
          className="mobile-warning-dismiss"
          onClick={onClose}
        >
          Got it
        </button>
      </div>
    </Modal>
  )
}
