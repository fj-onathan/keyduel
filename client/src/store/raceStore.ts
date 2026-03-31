import { create } from 'zustand'
import { env } from '../config/env'
import type { RaceResult, ServerEvent } from '../types/race'

type SocketState = 'idle' | 'connecting' | 'connected' | 'disconnected'

type RaceStore = {
  socketState: SocketState
  clientId: string
  displayName: string
  avatarUrl: string
  raceId: string
  roomId: string
  reconnectToken: string
  hub: string
  leaderId: string
  snippet: string
  snippetLen: number
  typed: string
  countdown: number
  participants: ServerEvent['participants']
  results: RaceResult[]
  statusMessage: string
  pendingSoloConfirm: boolean
  connect: () => void
  disconnect: () => void
  leaveRoom: () => void
  queueRace: (hub: string, mode: string, capacity: number) => void
  joinRace: (raceId: string) => void
  startRace: () => void
  confirmStart: (addBots: boolean) => void
  cancelSoloConfirm: () => void
  typeInput: (value: string) => void
  debugFinish: () => void
}

// ── private module-scoped state ──────────────────────────────────────────────
let socket: WebSocket | null = null
let pendingAction: (() => void) | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectAttempt = 0
let intentionalClose = false

// ── input throttle state ─────────────────────────────────────────────────────
let inputThrottleTimer: ReturnType<typeof setTimeout> | null = null
let pendingInput: { progress: number; errors: number } | null = null

// ── constants ────────────────────────────────────────────────────────────────
const HEARTBEAT_INTERVAL_MS = 25_000 // send heartbeat every 25s (server read deadline is 60s)
const INPUT_THROTTLE_MS = 50 // send race_input at most every 50ms
const RECONNECT_BASE_MS = 500 // first retry after 500ms
const RECONNECT_MAX_MS = 8_000 // cap at 8s
const RECONNECT_MAX_ATTEMPTS = 10
const SESSION_STORAGE_KEY = 'keyduel_race_session'
const GUEST_ID_KEY = 'keyduel_guest_id'

// ── stable guest identity ───────────────────────────────────────────────────

function getOrCreateGuestId(): string {
  try {
    const existing = localStorage.getItem(GUEST_ID_KEY)
    if (existing) return existing
    // Generate a short random guest id
    const id = `guest-${crypto.randomUUID().slice(0, 8)}`
    localStorage.setItem(GUEST_ID_KEY, id)
    return id
  } catch {
    // localStorage unavailable — fall back to a random id per session
    return `guest-${Math.random().toString(36).slice(2, 10)}`
  }
}

const stableGuestId = getOrCreateGuestId()

// ── sessionStorage helpers ──────────────────────────────────────────────────

type SavedSession = {
  reconnectToken: string
  raceId: string
  roomId: string
  hub: string
}

function persistSession(data: SavedSession) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage may be unavailable (private browsing, quota exceeded)
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // ignore
  }
}

/** Returns saved reconnect token if one exists for the given raceId, or empty string. */
export function getSavedSession(raceId: string): SavedSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as SavedSession
    if (saved.raceId === raceId && saved.reconnectToken) {
      return saved
    }
  } catch {
    // ignore
  }
  return null
}

// ── helpers ──────────────────────────────────────────────────────────────────

function sendEvent(payload: unknown) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return
  }
  socket.send(JSON.stringify(payload))
}

/** Fetch finished race data from the REST API and populate store results. */
function fetchFinishedRace(raceId: string, set: (partial: Partial<RaceStore>) => void) {
  fetch(`${env.apiBaseUrl}/races/${encodeURIComponent(raceId)}`)
    .then((res) => {
      if (!res.ok) throw new Error('not found')
      return res.json()
    })
    .then((data: {
      snippet?: string
      snippetLen?: number
      hubSlug?: string
      participants?: {
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
    }) => {
      const results: RaceResult[] = (data.participants ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((p) => ({
          clientId: p.clientId,
          displayName: p.displayName,
          avatarUrl: p.avatarUrl,
          position: p.position,
          completionPercent: p.completionPercent,
          progress: Math.round(((p.completionPercent) / 100) * (data.snippetLen ?? 0)),
          grossWpm: p.grossWpm,
          netWpm: p.netWpm,
          accuracy: p.accuracy,
          errors: p.errors,
          finished: p.finished,
          finishedElapsedMs: p.finishedElapsedMs ?? 0,
          suspicious: false,
        }))
      set({
        snippet: data.snippet ?? '',
        snippetLen: data.snippetLen ?? 0,
        hub: data.hubSlug ?? '',
        results,
        statusMessage: 'Race finished',
      })
    })
    .catch(() => {
      // If the API call fails, leave the "race already finished" message
    })
}

function clearHeartbeat() {
  if (heartbeatTimer !== null) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function flushInput() {
  if (pendingInput) {
    sendEvent({ type: 'race_input', ...pendingInput })
    pendingInput = null
  }
  if (inputThrottleTimer !== null) {
    clearTimeout(inputThrottleTimer)
    inputThrottleTimer = null
  }
}

/** Enqueue a race_input event, sending at most once per INPUT_THROTTLE_MS. */
function throttledInput(progress: number, errors: number) {
  pendingInput = { progress, errors }
  if (inputThrottleTimer !== null) return // timer already running — will flush
  // Send immediately (leading edge) then start the cooldown
  flushInput()
  inputThrottleTimer = setTimeout(() => {
    flushInput()
  }, INPUT_THROTTLE_MS)
}

function clearReconnectTimer() {
  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function startHeartbeat(getState: () => RaceStore) {
  clearHeartbeat()
  heartbeatTimer = setInterval(() => {
    const token = getState().reconnectToken
    sendEvent({ type: 'heartbeat', reconnectToken: token || undefined })
  }, HEARTBEAT_INTERVAL_MS)
}

function reconnectDelay(): number {
  const delay = Math.min(RECONNECT_BASE_MS * 2 ** reconnectAttempt, RECONNECT_MAX_MS)
  // add jitter: 0–25% of delay
  return delay + Math.floor(Math.random() * delay * 0.25)
}

// ── store ────────────────────────────────────────────────────────────────────

export const useRaceStore = create<RaceStore>((set, get) => ({
  socketState: 'idle',
  clientId: '',
  displayName: '',
  avatarUrl: '',
  raceId: '',
  roomId: '',
  reconnectToken: '',
  hub: 'go',
  leaderId: '',
  snippet: '',
  snippetLen: 0,
  typed: '',
  countdown: 0,
  participants: [],
  results: [],
  statusMessage: 'Select a hub to start racing',
  pendingSoloConfirm: false,

  connect: () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Already connected — run pending action immediately
      if (pendingAction) {
        const action = pendingAction
        pendingAction = null
        action()
      }
      return
    }

    // Abort if already connecting
    if (socket && socket.readyState === WebSocket.CONNECTING) {
      return
    }

    intentionalClose = false
    clearReconnectTimer()
    set({ socketState: 'connecting', statusMessage: 'Connecting to race engine...' })

    const ws = new WebSocket(`${env.wsBaseUrl}?guestId=${encodeURIComponent(stableGuestId)}`)
    socket = ws

    ws.onopen = () => {
      // Guard: if this socket was superseded before it even opened, close it.
      if (socket !== ws) {
        ws.close()
        return
      }
      set({ socketState: 'connected', statusMessage: 'Connected. Waiting...' })
      reconnectAttempt = 0
      startHeartbeat(get)

      if (pendingAction) {
        const action = pendingAction
        pendingAction = null
        action()
      }
    }

    ws.onmessage = (event) => {
      // Ignore messages from a stale socket that hasn't been GC'd yet.
      if (socket !== ws) return

      const data = JSON.parse(event.data) as ServerEvent

      if (data.type === 'connected') {
        set({
          clientId: data.clientId ?? '',
          displayName: data.displayName ?? '',
          avatarUrl: data.avatarUrl ?? '',
        })
        return
      }

      if (data.type === 'session_assigned') {
        const token = data.sessionToken ?? ''
        set({ reconnectToken: token })
        // Persist to sessionStorage so we survive page reloads
        const state = get()
        if (token && state.raceId) {
          persistSession({ reconnectToken: token, raceId: state.raceId, roomId: state.roomId, hub: state.hub })
        }
        return
      }

      if (data.type === 'queued') {
        const queueLabel = data.queueKey ?? 'queue'
        const position = data.position ?? 0
        const queueHub = queueLabel.split('|')[0] || get().hub
        set({ hub: queueHub, statusMessage: `Queued in ${queueLabel} at position ${position}` })
        return
      }

      if (data.type === 'queue_left') {
        set({ statusMessage: 'Left queue' })
        return
      }

      if (data.type === 'room_left') {
        clearSession()
        set({
          roomId: '',
          raceId: '',
          snippet: '',
          snippetLen: 0,
          typed: '',
          countdown: 0,
          participants: [],
          results: [],
          leaderId: '',
          pendingSoloConfirm: false,
          statusMessage: 'Left room',
        })
        return
      }

      if (data.type === 'room_assigned') {
        const updates: Partial<RaceStore> = {
          roomId: data.roomId ?? '',
          raceId: data.raceId ?? '',
          snippetLen: data.snippetLen ?? 0,
          statusMessage: 'Joined race. Waiting for leader to start...',
        }
        if (data.leaderId) {
          updates.leaderId = data.leaderId
        }
        if (data.participants && data.participants.length > 0) {
          updates.participants = data.participants
        }
        set(updates)
        // Persist session for page reload recovery
        const state = get()
        if (state.reconnectToken && state.raceId) {
          persistSession({ reconnectToken: state.reconnectToken, raceId: state.raceId, roomId: state.roomId, hub: state.hub })
        }
        return
      }

      if (data.type === 'race_resumed') {
        const snippetText = data.snippet ?? ''
        const yourProgress = data.yourProgress ?? 0
        const updates: Partial<RaceStore> = {
          roomId: data.roomId ?? '',
          raceId: data.raceId ?? '',
          snippet: snippetText,
          snippetLen: snippetText.length || get().snippetLen,
          countdown: data.countdown ?? 0,
          participants: data.participants ?? [],
          statusMessage: data.message ?? 'Race resumed',
        }
        // Restore typed text from server-tracked progress so the user
        // doesn't have to retype everything after a page reload.
        if (snippetText && yourProgress > 0) {
          updates.typed = snippetText.slice(0, yourProgress)
        }
        if (data.leaderId) {
          updates.leaderId = data.leaderId
        }
        set(updates)
        // Persist session for page reload recovery
        const state = get()
        if (state.reconnectToken && state.raceId) {
          persistSession({ reconnectToken: state.reconnectToken, raceId: state.raceId, roomId: state.roomId, hub: state.hub })
        }
        return
      }

      if (data.type === 'race_countdown') {
        set({
          roomId: data.roomId ?? '',
          raceId: data.raceId ?? '',
          countdown: data.countdown ?? 0,
          snippetLen: data.snippetLen ?? get().snippetLen,
          snippet: '',
          typed: '',
          results: [],
          statusMessage: `Race starts in ${data.countdown ?? 0}`,
        })
        return
      }

      if (data.type === 'race_started') {
        set({
          roomId: data.roomId ?? '',
          raceId: data.raceId ?? '',
          snippet: data.snippet ?? '',
          snippetLen: data.snippetLen ?? 0,
          typed: '',
          countdown: 0,
          participants: data.participants ?? [],
          statusMessage: 'Race active!',
        })
        // Persist session for page reload recovery
        const state = get()
        if (state.reconnectToken && state.raceId) {
          persistSession({ reconnectToken: state.reconnectToken, raceId: state.raceId, roomId: state.roomId, hub: state.hub })
        }
        return
      }

      if (data.type === 'race_state_update') {
        set({ participants: data.participants ?? [] })
        return
      }

      if (data.type === 'race_cancelled') {
        clearSession()
        set({
          roomId: '',
          raceId: '',
          reconnectToken: '',
          leaderId: '',
          snippet: '',
          snippetLen: 0,
          typed: '',
          countdown: 0,
          participants: [],
          results: [],
          pendingSoloConfirm: false,
          statusMessage: data.message ?? 'Race cancelled',
        })
        return
      }

      if (data.type === 'race_finished') {
        clearSession()
        set({
          reconnectToken: '',
          countdown: 0,
          pendingSoloConfirm: false,
          results: data.results ?? [],
          statusMessage: `Race finished: ${data.message ?? 'done'}`,
        })
        return
      }

      if (data.type === 'presence_update') {
        const updates: Partial<RaceStore> = {}
        if (data.participants !== undefined) {
          updates.participants = data.participants

          // If another real player joined while the solo-confirm dialog is
          // open, auto-dismiss it — no need for bots anymore.
          const state = get()
          if (state.pendingSoloConfirm && data.participants) {
            const realCount = data.participants.filter((p) => !p.isBot).length
            if (realCount >= 2) {
              updates.pendingSoloConfirm = false
            }
          }
        }
        if (data.leaderId) {
          updates.leaderId = data.leaderId
        }
        if (Object.keys(updates).length > 0) {
          set(updates)
        }
        return
      }

      if (data.type === 'confirm_solo_start') {
        set({
          pendingSoloConfirm: true,
          statusMessage: data.message ?? 'No other participants. Add bots?',
        })
        return
      }

      if (data.type === 'leader_changed') {
        set({ leaderId: data.leaderId ?? '' })
        return
      }

      if (data.type === 'heartbeat_ack') {
        // Session keep-alive acknowledged — update token if server sent one
        if (data.sessionToken) {
          set({ reconnectToken: data.sessionToken })
          const state = get()
          if (state.raceId) {
            persistSession({ reconnectToken: data.sessionToken, raceId: state.raceId, roomId: state.roomId, hub: state.hub })
          }
        }
        return
      }

      if (data.type === 'error') {
        const msg = data.message ?? 'server error'
        set({ statusMessage: msg })

        // Terminal race errors — the user cannot join this race.
        // Stop any auto-reconnect cycle and clear the saved session
        // so we don't keep retrying the same doomed join.
        const terminalErrors = [
          'race is full',
          'race already in progress',
          'race already finished',
          'race not found',
        ]
        if (terminalErrors.includes(msg)) {
          clearReconnectTimer()
          reconnectAttempt = RECONNECT_MAX_ATTEMPTS // prevent future reconnects
          clearSession()

          // If the race is finished, fetch results from the REST API so
          // the user can still see their stats after a page refresh.
          if (msg === 'race already finished') {
            const raceId = get().raceId
            if (raceId) {
              fetchFinishedRace(raceId, set)
            }
          }
        }
      }
    }

    ws.onclose = () => {
      clearHeartbeat()

      // CRITICAL: If this is a stale WebSocket (replaced by a newer
      // connection, e.g. from page reload with the same guest ID),
      // ignore this close event entirely. The new socket is already
      // active — we must NOT null it out or trigger a reconnect cycle.
      if (socket !== ws) {
        return
      }

      socket = null

      if (intentionalClose) {
        set({ socketState: 'disconnected', statusMessage: 'Disconnected' })
        return
      }

      // Unexpected close — attempt auto-reconnect
      set({ socketState: 'disconnected', statusMessage: 'Connection lost. Reconnecting...' })
      scheduleReconnect()
    }

    ws.onerror = () => {
      // The onclose handler will fire after onerror, so we just log here.
      // No state change needed — onclose handles cleanup and reconnect.
    }
  },

  disconnect: () => {
    intentionalClose = true
    flushInput()
    clearHeartbeat()
    clearReconnectTimer()
    clearSession()
    reconnectAttempt = 0
    pendingAction = null

    if (socket) {
      socket.close()
      socket = null
    }
    set({
      socketState: 'idle',
      clientId: '',
      displayName: '',
      avatarUrl: '',
      raceId: '',
      roomId: '',
      reconnectToken: '',
      leaderId: '',
      snippet: '',
      snippetLen: 0,
      typed: '',
      countdown: 0,
      participants: [],
      results: [],
      pendingSoloConfirm: false,
      statusMessage: 'Select a hub to start racing',
    })
  },

  leaveRoom: () => {
    sendEvent({ type: 'leave_room' })
  },

  queueRace: (hub: string, mode: string, capacity: number) => {
    set({ hub })
    const doQueue = () => {
      sendEvent({
        type: 'queue_race',
        hub,
        mode,
        capacity,
        reconnectToken: get().reconnectToken || undefined,
      })
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      doQueue()
    } else {
      pendingAction = doQueue
      get().connect()
    }
  },

  joinRace: (raceId: string) => {
    set({ raceId })
    const doJoin = () => {
      // Use in-memory token if available, otherwise try sessionStorage (page reload case)
      let token = get().reconnectToken
      if (!token) {
        const saved = getSavedSession(raceId)
        if (saved) {
          token = saved.reconnectToken
          // Restore hub from saved session too
          set({ reconnectToken: token, hub: saved.hub })
        }
      }
      sendEvent({
        type: 'join_race',
        raceId,
        reconnectToken: token || undefined,
      })
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      doJoin()
    } else {
      pendingAction = doJoin
      get().connect()
    }
  },

  startRace: () => {
    sendEvent({ type: 'start_race' })
  },

  confirmStart: (addBots: boolean) => {
    sendEvent({ type: 'confirm_start', addBots })
    set({ pendingSoloConfirm: false })
  },

  cancelSoloConfirm: () => {
    set({ pendingSoloConfirm: false, statusMessage: 'Waiting for more players...' })
  },

  typeInput: (value: string) => {
    const snippet = get().snippet
    if (!snippet) {
      return
    }
    const sliced = value.slice(0, snippet.length)
    let errors = 0

    for (let i = 0; i < sliced.length; i += 1) {
      if (sliced[i] !== snippet[i]) {
        errors += 1
      }
    }

    set({ typed: sliced })

    throttledInput(sliced.length, errors)
  },

  debugFinish: () => {
    const { snippet } = get()
    if (!snippet) return
    set({ typed: snippet })
    // Clear any pending throttled input to avoid sending stale partial
    // progress right before the final event (which would trigger anti-cheat).
    pendingInput = null
    if (inputThrottleTimer !== null) {
      clearTimeout(inputThrottleTimer)
      inputThrottleTimer = null
    }
    sendEvent({ type: 'race_input', progress: snippet.length, errors: 0 })
  },
}))

// ── auto-reconnect scheduler ─────────────────────────────────────────────────

function scheduleReconnect() {
  clearReconnectTimer()

  if (reconnectAttempt >= RECONNECT_MAX_ATTEMPTS) {
    useRaceStore.setState({ statusMessage: 'Unable to reconnect. Please refresh the page.' })
    return
  }

  const delay = reconnectDelay()
  reconnectAttempt += 1

  reconnectTimer = setTimeout(() => {
    const { socketState, reconnectToken, raceId, roomId } = useRaceStore.getState()

    // Only reconnect if we're still disconnected
    if (socketState !== 'disconnected') {
      return
    }

    // If we had an active race/room, set up a pending action to re-join
    if (reconnectToken && raceId && roomId) {
      pendingAction = () => {
        sendEvent({
          type: 'join_race',
          raceId,
          reconnectToken,
        })
      }
    } else if (reconnectToken) {
      // Just send a heartbeat with the token to resume the session
      pendingAction = () => {
        sendEvent({
          type: 'heartbeat',
          reconnectToken,
        })
      }
    }

    useRaceStore.getState().connect()
  }, delay)
}
