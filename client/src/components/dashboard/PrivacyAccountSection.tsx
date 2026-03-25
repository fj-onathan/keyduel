import type { MyAccountResponse } from '../../lib/api'

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function PrivacyAccountSection({
  account,
  loading,
  onDeleteClick,
}: {
  account: MyAccountResponse | null
  loading: boolean
  onDeleteClick: () => void
}) {
  if (loading) {
    return (
      <section className="dashboard-section" aria-label="Privacy & Account">
        <h2>Privacy & Account</h2>
        <div className="dashboard-loading">Loading account info...</div>
      </section>
    )
  }

  if (!account) {
    return (
      <section className="dashboard-section" aria-label="Privacy & Account">
        <h2>Privacy & Account</h2>
        <p className="dashboard-empty">Unable to load account information.</p>
      </section>
    )
  }

  return (
    <section className="dashboard-section" aria-label="Privacy & Account">
      <h2>Privacy & Account</h2>

      <div className="dashboard-account-grid">
        <div className="dashboard-account-row">
          <span className="dashboard-account-label">Username</span>
          <span className="dashboard-account-value">{account.username}</span>
        </div>
        <div className="dashboard-account-row">
          <span className="dashboard-account-label">Email</span>
          <span className="dashboard-account-value">{account.email}</span>
        </div>
        <div className="dashboard-account-row">
          <span className="dashboard-account-label">Auth Provider</span>
          <span className="dashboard-account-value">{account.authProvider}</span>
        </div>
        {account.githubId ? (
          <div className="dashboard-account-row">
            <span className="dashboard-account-label">GitHub ID</span>
            <span className="dashboard-account-value">{account.githubId}</span>
          </div>
        ) : null}
        <div className="dashboard-account-row">
          <span className="dashboard-account-label">Member Since</span>
          <span className="dashboard-account-value">{formatMemberSince(account.createdAt)}</span>
        </div>
      </div>

      <div className="dashboard-danger-zone">
        <h3>Danger Zone</h3>
        <p>
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <button
          type="button"
          className="dashboard-delete-btn"
          onClick={onDeleteClick}
        >
          Delete Account
        </button>
      </div>
    </section>
  )
}
