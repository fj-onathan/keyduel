import {useCallback, useEffect, useMemo, useState} from 'react'
import {apiGet} from '../../lib/api'
import {Modal} from '../ui/Modal'

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

type HubsResponse = {
  items: HubItem[]
  total?: number
}

export function HubSelectionModal({
                                    open,
                                    onClose,
                                    onSelect,
                                  }: {
  open: boolean
  onClose: () => void
  onSelect: (hub: HubItem) => void
}) {
  const [hubs, setHubs] = useState<HubItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state before async fetch
    setLoading(true)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError('')

    void apiGet<HubsResponse>('/hubs?activeOnly=true', {signal: controller.signal})
      .then((payload) => {
        setHubs(payload.items)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setError(err instanceof Error ? err.message : 'Failed to load hubs')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return hubs.sort((a, b) => b.activePlayers - a.activePlayers || b.racesToday - a.racesToday || a.title.localeCompare(b.title))
    }
    return hubs
      .filter((hub) => hub.title.toLowerCase().includes(q) || hub.language.toLowerCase().includes(q) || hub.slug.toLowerCase().includes(q))
      .sort((a, b) => b.activePlayers - a.activePlayers || a.title.localeCompare(b.title))
  }, [hubs, query])

  const handleSelect = useCallback(
    (hub: HubItem) => {
      onSelect(hub)
    },
    [onSelect],
  )

  return (
    <Modal open={open} onClose={onClose} title="Choose your arena">
      <div className="hub-modal-search">
        <input
          type="text"
          className="hub-modal-input"
          placeholder="Search languages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {loading ? (
        <div className="hub-modal-loading">
          <span className="hub-modal-spinner"/>
          Loading hubs...
        </div>
      ) : null}

      {error ? (
        <div className="hub-modal-error">
          <p>{error}</p>
        </div>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <div className="hub-modal-empty">
          <p>No hubs match "{query}"</p>
        </div>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <ul className="hub-modal-list">
          {filtered.map((hub) => (
            <li key={hub.id}>
              <button
                type="button"
                className="hub-modal-item"
                onClick={() => handleSelect(hub)}
              >
                <div className="hub-modal-item-info">
                  <strong>{hub.title}</strong>
                  <span className="hub-modal-item-meta">
                    {hub.activePlayers} online &middot; {hub.racesToday} races today &middot; {hub.snippetsTotal} snippets
                  </span>
                </div>
                <div className="hub-modal-item-pills">
                  <span className={`hub-pill ${hub.isRanked ? 'hub-pill-ranked' : 'hub-pill-casual'}`}>
                    {hub.isRanked ? 'Ranked' : 'Casual'}
                  </span>
                </div>
                <span className="hub-modal-item-arrow">&rarr;</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </Modal>
  )
}
