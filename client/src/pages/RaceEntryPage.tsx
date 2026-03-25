import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HubSelectionModal } from '../components/race/HubSelectionModal'

type HubItem = {
  id: string
  slug: string
  language: string
  title: string
  isRanked: boolean
  isActive: boolean
  activePlayers: number
  snippetsTotal: number
  racesToday: number
  leaderToday: {
    username: string
    value: number
    metric: 'wins' | 'speed'
  } | null
}

export function RaceEntryPage() {
  const [modalOpen, setModalOpen] = useState(true)
  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    setModalOpen(false)
    void navigate('/hubs')
  }, [navigate])

  const handleSelect = useCallback(
    (hub: HubItem) => {
      setModalOpen(false)
      // Navigate to the lobby page which calls find-or-create
      void navigate(`/race/${hub.slug}`)
    },
    [navigate],
  )

  return (
    <main className="race-entry-page">
      <HubSelectionModal open={modalOpen} onClose={handleClose} onSelect={handleSelect} />
      {!modalOpen ? (
        <div className="race-entry-redirect">
          <span className="hub-modal-spinner" />
          <p>Redirecting...</p>
        </div>
      ) : null}
    </main>
  )
}
