import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {apiPost} from '../lib/api'

type FindOrCreateResponse = {
  raceId: string
  roomId: string
  hub: string
}

export function RaceLobbyPage() {
  const {hub} = useParams<{ hub: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hub) {
      void navigate('/')
      return
    }

    const controller = new AbortController()

    void apiPost<FindOrCreateResponse>(
      '/api/races/find-or-create',
      {hub, mode: 'sprint', capacity: 2},
      {signal: controller.signal},
    )
      .then((result) => {
        void navigate(`/race/${hub}/${result.raceId}`, {replace: true})
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setError(err instanceof Error ? err.message : 'Failed to find or create race')
      })

    return () => {
      controller.abort()
    }
  }, [hub, navigate])

  if (error) {
    return (
      <main className="race-entry-page">
        <div className="race-entry-redirect">
          <p style={{color: '#ff5d5d'}}>{error}</p>
          <button
            type="button"
            style={{
              marginTop: '1rem',
              color: 'var(--accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)'
            }}
            onClick={() => void navigate('/race')}
          >
            Back to hub selection
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="race-entry-page">
      <div className="race-entry-redirect">
        <span className="hub-modal-spinner"/>
        <p>Finding a race in {hub}...</p>
      </div>
    </main>
  )
}
