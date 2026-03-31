import {useEffect, useMemo, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {RaceEditorPanel} from '../components/race/RaceEditorPanel'
import {RaceResults} from '../components/race/RaceResults'
import {RaceStandings} from '../components/race/RaceStandings'
import {env} from '../config/env'
import type {ParticipantSnapshot, RaceResult} from '../types/race'

type RaceDetailResponse = {
  raceId: string
  hubSlug: string
  hubTitle: string
  snippet: string
  snippetLang: string
  snippetLen: number
  difficulty: number
  status: string
  finishReason?: string
  startedAt?: string
  endedAt?: string
  durationMs?: number
  createdAt: string
  participants: {
    clientId: string
    displayName?: string
    avatarUrl?: string
    position: number
    completionPercent: number
    grossWpm: number
    netWpm: number
    accuracy: number
    errors: number
    finished: boolean
    finishedElapsedMs: number | null
  }[]
}

const hubDisplayName: Record<string, string> = {
  go: 'Golang',
  golang: 'Golang',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  javascript: 'JavaScript',
  js: 'JavaScript',
  python: 'Python',
  rust: 'Rust',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  php: 'PHP',
}

function formatHubName(hub: string): string {
  return hubDisplayName[hub.toLowerCase()] ?? hub.charAt(0).toUpperCase() + hub.slice(1)
}

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RaceReplayPage() {
  const {raceId} = useParams<{ hub: string; raceId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<RaceDetailResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!raceId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- early exit state
      setError('Missing race ID')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state before async fetch
    setLoading(true)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null)

    fetch(`${env.apiBaseUrl}/races/${encodeURIComponent(raceId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Race not found')
        return res.json()
      })
      .then((json: RaceDetailResponse) => {
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [raceId])

  const participants = useMemo<ParticipantSnapshot[]>(() => {
    if (!data) return []
    return data.participants
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((p) => ({
        clientId: p.clientId,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        progress: Math.round((p.completionPercent / 100) * data.snippetLen),
        errors: p.errors,
        grossWpm: p.grossWpm,
        netWpm: p.netWpm,
        accuracy: p.accuracy,
        finished: p.finished,
      }))
  }, [data])

  const results = useMemo<RaceResult[]>(() => {
    if (!data) return []
    return data.participants
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((p) => ({
        clientId: p.clientId,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        position: p.position,
        completionPercent: p.completionPercent,
        progress: Math.round((p.completionPercent / 100) * data.snippetLen),
        grossWpm: p.grossWpm,
        netWpm: p.netWpm,
        accuracy: p.accuracy,
        errors: p.errors,
        finished: p.finished,
        finishedElapsedMs: p.finishedElapsedMs ?? 0,
        suspicious: false,
      }))
  }, [data])

  if (loading) {
    return (
      <main className="race-shell">
        <div className="race-replay-loading">
          <p>Loading race data...</p>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="race-shell">
        <div className="race-replay-error">
          <h2>Race Not Found</h2>
          <p>{error ?? 'Could not load race data.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/race')}>
            Back to Race
          </button>
        </div>
      </main>
    )
  }

  const finishReasonLabel: Record<string, string> = {
    all_finished: 'All players finished',
    timeout: 'Time limit reached',
    insufficient_players: 'Insufficient players',
  }

  return (
    <main className="race-shell">
      <section className="race-header">
        <div className="race-header-top">
          <div className="race-hub-display">
            <span className="race-hub-label">{formatHubName(data.hubSlug)}</span>
            <span className="race-chip">{data.snippetLang}</span>
          </div>

          <div className="race-header-chips">
            <div className="race-chips-status">
              <span className="race-chip race-chip-room">
                <span className="race-chip-dot"/>
                Race {data.raceId.slice(0, 8)}
              </span>
              <span className="race-chip race-chip-phase is-finished">
                <span className="race-chip-dot"/>
                Finished
              </span>
              <span className="race-chip race-chip-replay">
                <span className="race-chip-dot"/>
                Replay
              </span>
            </div>
          </div>
        </div>

        <div className="race-hud-strip">
          <div className="race-hud-cell">
            <span className="race-hud-label">Players</span>
            <strong className="race-hud-value">{data.participants.length}</strong>
          </div>
          <div className="race-hud-cell">
            <span className="race-hud-label">Winner WPM</span>
            <strong className="race-hud-value">
              {data.participants[0] ? data.participants[0].netWpm.toFixed(1) : '--'}
            </strong>
          </div>
          <div className="race-hud-cell">
            <span className="race-hud-label">Duration</span>
            <strong className="race-hud-value">{data.durationMs ? formatDuration(data.durationMs) : '--'}</strong>
          </div>
          <div className="race-hud-cell">
            <span className="race-hud-label">Finished</span>
            <strong className="race-hud-value">{data.startedAt ? formatDate(data.startedAt) : '--'}</strong>
          </div>
        </div>

        <div className="race-header-status">
          <p>
            {finishReasonLabel[data.finishReason ?? ''] ?? 'Race completed'} — {data.participants.length} participant
            {data.participants.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="race-header-actions">
          <button className="btn btn-secondary" onClick={() => navigate(`/race/${data.hubSlug}`)}>
            Race Again
          </button>
        </div>
      </section>

      <div className="race-main-grid">
        <RaceEditorPanel
          snippet={data.snippet}
          typed={data.snippet}
          countdown={0}
          progressPercent={100}
          phase="finished"
          difficulty={data.difficulty}
          timeRemainingSeconds={0}
          isLowTime={false}
          onType={() => {
          }}
        />
        <RaceStandings
          participants={participants}
          clientId=""
          snippetLength={data.snippetLen}
          phase="finished"
        />
      </div>

      <RaceResults results={results}/>
    </main>
  )
}
