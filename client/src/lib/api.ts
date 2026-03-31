import {env} from '../config/env'

// Session expiry handler — called when any API request receives a 401.
// This is set by the auth store to clear auth state without creating
// a circular import dependency.
let onSessionExpired: (() => void) | null = null

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
}

function handle401(path: string) {
  // Don't trigger session expiry for /auth/me — that's the initial check
  // and returns 401 when not logged in (expected behavior).
  if (path === '/auth/me') return
  onSessionExpired?.()
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'GET',
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) handle401(path)
    let detail = response.statusText
    try {
      const payload = (await response.json()) as { error?: { message?: string } }
      if (payload.error?.message) {
        detail = payload.error.message
      }
    } catch {
      // no-op
    }
    throw new Error(`${response.status}: ${detail}`)
  }

  return (await response.json()) as T
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const baseUrl = path.startsWith('/api/races') ? env.raceEngineBaseUrl : env.apiBaseUrl

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    if (response.status === 401) handle401(path)
    let detail = response.statusText
    try {
      const payload = (await response.json()) as { error?: { message?: string } }
      if (payload.error?.message) {
        detail = payload.error.message
      }
    } catch {
      // no-op
    }
    throw new Error(`${response.status}: ${detail}`)
  }

  return (await response.json()) as T
}

export async function apiDelete<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'DELETE',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    if (response.status === 401) handle401(path)
    let detail = response.statusText
    try {
      const payload = (await response.json()) as { error?: { message?: string } }
      if (payload.error?.message) {
        detail = payload.error.message
      }
    } catch {
      // no-op
    }
    throw new Error(`${response.status}: ${detail}`)
  }

  return (await response.json()) as T
}

// --- Auth API ---

export type AuthUser = {
  id: string
  email: string
  authProvider: string
  createdAt: string
}

export type AuthProfile = {
  username: string
  displayName: string
  avatarUrl: string
  countryCode: string
  headline: string
  bio: string
  websiteUrl: string
  location: string
}

export type AuthMeResponse = {
  user: AuthUser
  profile: AuthProfile
}

export function getMe(): Promise<AuthMeResponse> {
  return apiGet<AuthMeResponse>('/auth/me')
}

export function logout(): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/logout', {})
}

// --- User Management API ---

export type MyRaceItem = {
  raceId: string
  roomId: string
  hub: string
  hubTitle: string
  finishReason: string
  startedAt: string | null
  endedAt: string | null
  finalPosition: number
  completionPercent: number
  netWpm: number
  accuracy: number
  errorsCount: number
  createdAt: string
}

export type MyRacesResponse = {
  items: MyRaceItem[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export function getMyRaces(params?: { limit?: number; offset?: number; hub?: string }): Promise<MyRacesResponse> {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.offset) searchParams.set('offset', String(params.offset))
  if (params?.hub) searchParams.set('hub', params.hub)
  const qs = searchParams.toString()
  return apiGet<MyRacesResponse>(`/api/me/races${qs ? `?${qs}` : ''}`)
}

export type HubStat = {
  slug: string
  title: string
  racesPlayed: number
  wins: number
  avgWpm: number
  bestWpm: number
  avgAccuracy: number
}

export type MyHubStatsResponse = {
  items: HubStat[]
}

export function getMyHubStats(): Promise<MyHubStatsResponse> {
  return apiGet<MyHubStatsResponse>('/api/me/hub-stats')
}

export type MyAccountResponse = {
  email: string
  authProvider: string
  username: string
  githubId?: number
  createdAt: string
}

export function getMyAccount(): Promise<MyAccountResponse> {
  return apiGet<MyAccountResponse>('/api/me/account')
}

export function deleteMyAccount(): Promise<{ message: string }> {
  return apiDelete<{ message: string }>('/api/me/account', {confirm: 'DELETE'})
}
