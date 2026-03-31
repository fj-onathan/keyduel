import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { RaceEditorPanel } from '../components/race/RaceEditorPanel'
import { RaceHeader } from '../components/race/RaceHeader'
import { RaceResults } from '../components/race/RaceResults'
import { RaceStandings } from '../components/race/RaceStandings'
import { playFinishSound } from '../lib/sounds'
import { useRaceStore, getSavedSession } from '../store/raceStore'
import { useToastStore } from '../store/toastStore'
import { useUIStore } from '../store/uiStore'
import { env } from '../config/env'
import type { ParticipantSnapshot, RaceResult } from '../types/race'

const MOCK_SNIPPET = `package main

import "fmt"

func main() {
  values := []int{3, 5, 8, 13}
  sum := 0
  for _, n := range values {
    sum += n
  }
  fmt.Println("sum:", sum)
}`

function clampProgress(progress: number, snippetLength: number) {
  return Math.max(0, Math.min(snippetLength, progress))
}

export function RacePage() {
  const { hub: hubParam, raceId: raceIdParam } = useParams<{ hub: string; raceId: string }>()
  const location = useLocation()
  const disconnect = useRaceStore((state) => state.disconnect)
  const leaveRoom = useRaceStore((state) => state.leaveRoom)
  const joinRace = useRaceStore((state) => state.joinRace)
  const startRace = useRaceStore((state) => state.startRace)
  const typeInput = useRaceStore((state) => state.typeInput)
  const socketState = useRaceStore((state) => state.socketState)
  const statusMessage = useRaceStore((state) => state.statusMessage)
  const clientId = useRaceStore((state) => state.clientId)
  const roomId = useRaceStore((state) => state.roomId)
  const countdown = useRaceStore((state) => state.countdown)
  const snippet = useRaceStore((state) => state.snippet)
  const typed = useRaceStore((state) => state.typed)
  const participants = useRaceStore((state) => state.participants)
  const results = useRaceStore((state) => state.results)
  const hub = useRaceStore((state) => state.hub)
  const leaderId = useRaceStore((state) => state.leaderId)
  const snippetLen = useRaceStore((state) => state.snippetLen)
  const raceDurationMs = useRaceStore((state) => state.raceDurationMs)
  const raceStartedAt = useRaceStore((state) => state.raceStartedAt)
  const storeRaceId = useRaceStore((state) => state.raceId)

  const [mockTyped, setMockTyped] = useState('')
  const [mockCountdown, setMockCountdown] = useState(3)
  const [mockElapsedMs, setMockElapsedMs] = useState(0)
  const [timeRemainingMs, setTimeRemainingMs] = useState(0)
  const navigate = useNavigate()
  const addToast = useToastStore((state) => state.addToast)
  const soundEnabled = useUIStore((state) => state.soundEnabled)
  const prevParticipantIds = useRef<Set<string>>(new Set())
  const prevPhaseRef = useRef<string>('queued')

  const isMock = useMemo(() => new URLSearchParams(location.search).get('mock') === '1', [location.search])

  // If the store holds state from a different race (e.g. user navigated away
  // from a finished race via the nav bar without clicking "Race Again"),
  // reset the store so stale results/snippet don't bleed into the new race.
  useEffect(() => {
    if (isMock || !raceIdParam) return
    if (storeRaceId && storeRaceId !== raceIdParam) {
      disconnect()
      prevParticipantIds.current = new Set()
    }
  }, [isMock, raceIdParam, storeRaceId, disconnect])

  useEffect(() => {
    if (!isMock) {
      return
    }
    /* eslint-disable react-hooks/set-state-in-effect -- batch reset for mock mode */
    setMockTyped('')
    setMockCountdown(3)
    setMockElapsedMs(0)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isMock])

  useEffect(() => {
    if (!isMock || mockCountdown <= 0) {
      return
    }
    const timer = window.setInterval(() => {
      setMockCountdown((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isMock, mockCountdown])

  useEffect(() => {
    if (!isMock || mockCountdown > 0) {
      return
    }
    const timer = window.setInterval(() => {
      setMockElapsedMs((value) => value + 150)
    }, 150)
    return () => window.clearInterval(timer)
  }, [isMock, mockCountdown])

  // Sync store hub from URL param so session persistence saves the correct hub.
  useEffect(() => {
    if (isMock || !hubParam) return
    if (hub !== hubParam) {
      useRaceStore.setState({ hub: hubParam })
    }
  }, [isMock, hubParam, hub])

  // If the user lands on a finished race URL (e.g. shared link, page
  // refresh after session was cleared), check the REST API and redirect
  // to the read-only replay page so they see full results/history.
  useEffect(() => {
    if (isMock || !raceIdParam || !hubParam) return
    // Already in this room via WebSocket — nothing to check
    if (roomId) return
    // Has a saved session — the auto-rejoin effect below will handle it
    const saved = getSavedSession(raceIdParam)
    if (saved) return
    // Already have results in the store (race just finished in this tab)
    if (results.length > 0) return

    let cancelled = false
    fetch(`${env.apiBaseUrl}/races/${encodeURIComponent(raceIdParam)}`)
      .then((res) => {
        if (!res.ok) return null
        return res.json()
      })
      .then((data: { status?: string } | null) => {
        if (cancelled || !data) return
        if (data.status === 'finished' || data.status === 'cancelled') {
          void navigate(`/race/${hubParam}/${raceIdParam}/replay`, { replace: true })
        }
      })
      .catch(() => {
        // Race not found or network error — stay on page, user can click Join
      })

    return () => { cancelled = true }
  }, [isMock, raceIdParam, hubParam, roomId, results.length, navigate])

  // Pre-join: poll the race-engine REST API every 5s so visitors can see
  // who's in the room before clicking "Join Race". Once the user joins
  // (roomId becomes truthy), polling stops and the WebSocket takes over.
  // This effect ONLY sets participants and snippetLen — never snippet, typed,
  // countdown, or results — so it cannot affect phase detection.
  // TODO: Missing logic when user left and it's the leader - other users will not
  // get error, but can't join and it's annoying, tricky case.
  useEffect(() => {
    if (isMock || !raceIdParam) return
    // Already connected to this room — WebSocket provides live data
    if (roomId) return
    // Has a saved session — the auto-rejoin effect will handle it
    const saved = getSavedSession(raceIdParam)
    if (saved) return
    // Already have results (finished race)
    if (results.length > 0) return

    let cancelled = false

    const fetchInfo = () => {
      fetch(`${env.raceEngineBaseUrl}/api/races/info/${encodeURIComponent(raceIdParam)}`)
        .then((res) => {
          if (!res.ok) {
            // Room was deleted (everyone left) or race not found — clear
            // the stale participant list so the viewer sees it go empty.
            if (!cancelled && !useRaceStore.getState().roomId) {
              useRaceStore.setState({ participants: [] })
            }
            return null
          }
          return res.json()
        })
        .then((data: { participants?: ParticipantSnapshot[]; snippetLen?: number; status?: string } | null) => {
          if (cancelled || !data) return
          // Only populate if the user still hasn't joined
          const currentState = useRaceStore.getState()
          if (currentState.roomId) return
          const updates: Partial<{ participants: ParticipantSnapshot[]; snippetLen: number }> = {}
          updates.participants = data.participants ?? []
          if (data.snippetLen && data.snippetLen > 0) {
            updates.snippetLen = data.snippetLen
          }
          useRaceStore.setState(updates)
        })
        .catch(() => {
          // Network error — clear participants to avoid stale data
          if (!cancelled && !useRaceStore.getState().roomId) {
            useRaceStore.setState({ participants: [] })
          }
        })
    }

    // Fetch immediately, then poll every 5s
    fetchInfo()
    const interval = window.setInterval(fetchInfo, 5_000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [isMock, raceIdParam, roomId, results.length])

  // Auto-rejoin only on page refresh (when a saved session exists for this
  // race). Fresh visitors must click "Join Race" manually.
  useEffect(() => {
    if (isMock || !raceIdParam) return
    // Already in this room — nothing to do
    if (roomId) return
    // Only auto-join if we have a saved session (i.e. page was refreshed)
    const saved = getSavedSession(raceIdParam)
    if (!saved) return
    joinRace(raceIdParam)
  }, [isMock, raceIdParam, roomId, joinRace])

  const snippetValue = isMock ? MOCK_SNIPPET : snippet
  const typedValue = isMock ? mockTyped : typed
  const snippetLength = snippetValue.length

  const mockBotProgress = useMemo(() => {
    if (!isMock) {
      return { alpha: 0, beta: 0 }
    }
    if (typedValue.length === 0) {
      return { alpha: 0, beta: 0 }
    }

    const maxBotProgress = Math.max(0, snippetLength - 2)

    return {
      alpha: clampProgress(Math.min(maxBotProgress, Math.floor(mockElapsedMs / 420)), snippetLength),
      beta: clampProgress(Math.min(maxBotProgress, Math.floor(mockElapsedMs / 520)), snippetLength),
    }
  }, [isMock, mockElapsedMs, snippetLength, typedValue.length])

  const mockParticipants = useMemo<ParticipantSnapshot[]>(() => {
    if (!isMock) {
      return []
    }
    const selfProgress = clampProgress(typedValue.length, snippetLength)
    const selfErrors = typedValue
      .split('')
      .slice(0, snippetLength)
      .reduce((sum, char, index) => (char === snippetValue[index] ? sum : sum + 1), 0)
    const selfAccuracy = selfProgress > 0 ? ((selfProgress - selfErrors) / selfProgress) * 100 : 100
    const youId = clientId || 'you-local'

    return [
      {
        clientId: youId,
        progress: selfProgress,
        errors: selfErrors,
        grossWpm: 94,
        netWpm: Math.max(8, 104 - selfErrors * 2),
        accuracy: selfAccuracy,
        finished: selfProgress >= snippetLength,
      },
      {
        clientId: 'bot_syntax',
        progress: mockBotProgress.alpha,
        errors: 3,
        grossWpm: 96,
        netWpm: 92,
        accuracy: 97.4,
        finished: mockBotProgress.alpha >= snippetLength,
      },
      {
        clientId: 'bot_cursor',
        progress: mockBotProgress.beta,
        errors: 5,
        grossWpm: 88,
        netWpm: 84,
        accuracy: 95.8,
        finished: mockBotProgress.beta >= snippetLength,
      },
    ]
  }, [clientId, isMock, mockBotProgress.alpha, mockBotProgress.beta, snippetLength, snippetValue, typedValue])

  const mockFinished = useMemo(() => {
    if (!isMock) {
      return false
    }
    return mockParticipants.some((participant) => participant.finished)
  }, [isMock, mockParticipants])

  const participantsValue = isMock ? mockParticipants : participants ?? []
  const resultsValue = useMemo<RaceResult[]>(() => {
    if (!isMock) {
      return results
    }
    if (!mockFinished) {
      return []
    }

    return mockParticipants
      .slice()
      .sort((a, b) => Number(b.finished) - Number(a.finished) || b.progress - a.progress || b.netWpm - a.netWpm)
      .map((participant, index) => ({
        clientId: participant.clientId,
        position: index + 1,
        completionPercent: snippetLength > 0 ? Math.min(100, (participant.progress / snippetLength) * 100) : 0,
        progress: participant.progress,
        grossWpm: participant.grossWpm,
        netWpm: participant.netWpm,
        accuracy: participant.accuracy,
        errors: participant.errors,
        finished: participant.finished,
        finishedElapsedMs: 0,
        suspicious: false,
      }))
  }, [isMock, mockFinished, mockParticipants, results, snippetLength])

  const activeSnippet = snippetValue.length > 0
  const progressPercent = activeSnippet ? Math.min(100, (typedValue.length / snippetValue.length) * 100) : 0

  const raceId = useMemo(() => raceIdParam ?? 'unknown', [raceIdParam])
  const phase = useMemo(() => {
    if (resultsValue.length > 0) {
      return 'finished' as const
    }
    if ((isMock ? mockCountdown : countdown) > 0) {
      return 'countdown' as const
    }
    if (activeSnippet) {
      return 'active' as const
    }
    return 'queued' as const
  }, [activeSnippet, countdown, isMock, mockCountdown, resultsValue.length])

  // Play finish sound when phase transitions to finished
  useEffect(() => {
    if (phase === 'finished' && prevPhaseRef.current !== 'finished' && soundEnabled) {
      playFinishSound()
    }
    prevPhaseRef.current = phase
  }, [phase, soundEnabled])

  // Race countdown timer — tick every second while race is active
  useEffect(() => {
    if (phase !== 'active') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset timer when leaving active phase
      setTimeRemainingMs(0)
      return
    }
    if (isMock) {
      setTimeRemainingMs(Math.max(0, 90000 - mockElapsedMs))
      return
    }
    if (raceDurationMs <= 0 || raceStartedAt <= 0) {
      return
    }
    // Set immediately, then tick every second
    setTimeRemainingMs(Math.max(0, raceDurationMs - (Date.now() - raceStartedAt)))
    const timer = window.setInterval(() => {
      setTimeRemainingMs(Math.max(0, raceDurationMs - (Date.now() - raceStartedAt)))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [phase, isMock, mockElapsedMs, raceDurationMs, raceStartedAt])

  const timeRemainingSeconds = Math.ceil(timeRemainingMs / 1000)
  const isLowTime = phase === 'active' && timeRemainingSeconds <= 15

  const statusMessageValue = useMemo(() => {
    if (!isMock) {
      return statusMessage
    }
    if (phase === 'countdown') {
      return `Debug mode active. Mock race starts in ${mockCountdown}.`
    }
    if (phase === 'active') {
      return 'Debug mode active. Type now to test editor UX.'
    }
    if (phase === 'finished') {
      return 'Debug mode active. Mock race finished.'
    }
    return 'Debug mode active. Queue buttons reset mock race.'
  }, [isMock, mockCountdown, phase, statusMessage])

  const socketStateValue = isMock ? 'connected' : socketState
  const roomIdValue = isMock ? 'mock-room' : roomId

  const sortedParticipants = useMemo(
    () =>
      participantsValue
        .slice()
        .sort((a, b) => Number(b.finished) - Number(a.finished) || b.progress - a.progress || b.netWpm - a.netWpm),
    [participantsValue],
  )

  const selfParticipant = useMemo(
    () => sortedParticipants.find((participant) => participant.clientId === clientId) ?? null,
    [clientId, sortedParticipants],
  )

  const selfRank = useMemo(() => {
    if (!clientId) {
      return null
    }
    const index = sortedParticipants.findIndex((participant) => participant.clientId === clientId)
    return index >= 0 ? index + 1 : null
  }, [clientId, sortedParticipants])

  const hud = useMemo(() => {
    const base = {
      rankLabel: '--',
      netWpmLabel: '--',
      accuracyLabel: '--',
      progressLabel: `${Math.round(progressPercent)}%`,
    }

    if (!selfParticipant) {
      return base
    }

    return {
      rankLabel: selfRank ? `#${selfRank}` : '--',
      netWpmLabel: `${selfParticipant.netWpm.toFixed(1)}`,
      accuracyLabel: `${selfParticipant.accuracy.toFixed(1)}%`,
      progressLabel: `${Math.round(progressPercent)}%`,
    }
  }, [progressPercent, selfParticipant, selfRank])

  const handleType = useCallback(
    (nextValue: string) => {
      if (isMock) {
        setMockTyped(nextValue.slice(0, snippetLength))
        return
      }
      typeInput(nextValue)
    },
    [isMock, snippetLength, typeInput],
  )

  const resetMockRace = useCallback(() => {
    setMockTyped('')
    setMockCountdown(3)
    setMockElapsedMs(0)
  }, [])

  const handleJoin = useCallback(() => {
    if (isMock) {
      resetMockRace()
      return
    }
    if (raceIdParam) {
      joinRace(raceIdParam)
    }
  }, [isMock, joinRace, raceIdParam, resetMockRace])

  const handleLeaveRoom = useCallback(() => {
    if (isMock) {
      resetMockRace()
      return
    }
    leaveRoom()
    // Give the WebSocket frame time to reach the server before tearing
    // down the connection. Without this, disconnect() closes the socket
    // before the leave_room message is delivered, so other participants
    // never get a presence_update with the updated roster.
    setTimeout(() => {
      disconnect()
    }, 100)
    void navigate('/race')
  }, [disconnect, isMock, leaveRoom, navigate, resetMockRace])

  const handleStartRace = useCallback(() => {
    if (isMock) {
      resetMockRace()
      return
    }
    startRace()
  }, [isMock, startRace, resetMockRace])

  const handleRaceAgain = useCallback(() => {
    if (isMock) {
      resetMockRace()
      return
    }
    disconnect()
    void navigate(`/race/${hubParam ?? 'go'}`)
  }, [disconnect, hubParam, isMock, navigate, resetMockRace])

  // Track player join/leave for toast notifications
  useEffect(() => {
    if (isMock) {
      return
    }
    const currentIds = new Set(participantsValue.map((p) => p.clientId))
    const prevIds = prevParticipantIds.current

    // If participants were cleared (e.g. disconnect() reset), just update
    // the ref without firing toasts to avoid phantom "player left" messages.
    if (currentIds.size === 0) {
      prevParticipantIds.current = currentIds
      return
    }

    if (prevIds.size > 0) {
      for (const id of currentIds) {
        if (!prevIds.has(id) && id !== clientId) {
          addToast(`Player joined the race`, 'info', 2500)
        }
      }
      for (const id of prevIds) {
        if (!currentIds.has(id) && id !== clientId) {
          addToast(`Player left the race`, 'warning', 2500)
        }
      }
    }

    prevParticipantIds.current = currentIds
  }, [addToast, clientId, isMock, participantsValue])

  return (
    <main className="race-shell">
      <RaceHeader
        raceId={raceId}
        roomId={roomIdValue}
        hub={isMock ? 'go' : (hubParam ?? hub)}
        socketState={socketStateValue}
        statusMessage={statusMessageValue}
        phase={phase}
        hud={hud}
        snippetLen={snippetLength || snippetLen}
        playerCount={participantsValue.length}
        isLeader={!isMock && clientId !== '' && leaderId === clientId}
        timeRemainingSeconds={timeRemainingSeconds}
        isLowTime={isLowTime}
        onJoin={handleJoin}
        onLeaveRoom={handleLeaveRoom}
        onStartRace={handleStartRace}
        onRaceAgain={handleRaceAgain}
      />

      <div className="race-main-grid">
        <RaceEditorPanel
          snippet={snippetValue}
          typed={typedValue}
          countdown={isMock ? mockCountdown : countdown}
          progressPercent={progressPercent}
          phase={phase}
          difficulty={isMock ? 2 : undefined}
          avgTime={isMock ? 45 : undefined}
          timeRemainingSeconds={timeRemainingSeconds}
          isLowTime={isLowTime}
          onType={handleType}
        />
        <RaceStandings participants={sortedParticipants} clientId={clientId || 'you-local'} snippetLength={snippetLength} phase={phase} />
      </div>

      <RaceResults results={resultsValue} replayUrl={!isMock && raceIdParam ? `/race/${hubParam ?? 'go'}/${raceIdParam}/replay` : undefined} />
    </main>
  )
}
