import { useCallback, useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'

export function DeleteAccountModal({
  open,
  onClose,
  onConfirm,
  isDeleting,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}) {
  const [confirmation, setConfirmation] = useState('')

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on close
      setConfirmation('')
    }
  }, [open])

  const canConfirm = confirmation === 'DELETE' && !isDeleting

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (canConfirm) {
        onConfirm()
      }
    },
    [canConfirm, onConfirm],
  )

  return (
    <Modal open={open} onClose={onClose} title="Delete Account">
      <form className="delete-account-modal-body" onSubmit={handleSubmit}>
        <p className="delete-account-warning">
          This action is <strong>permanent and irreversible</strong>. All of your
          race history, hub stats, and account data will be deleted forever.
        </p>

        <label className="delete-account-label" htmlFor="delete-confirm-input">
          Type <strong>DELETE</strong> to confirm:
        </label>
        <input
          id="delete-confirm-input"
          className="delete-account-input"
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
          disabled={isDeleting}
        />

        <div className="delete-account-actions">
          <button
            type="button"
            className="delete-account-cancel-btn"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="delete-account-confirm-btn"
            disabled={!canConfirm}
          >
            {isDeleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
