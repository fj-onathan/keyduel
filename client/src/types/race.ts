export type ClientEvent =
  | {
  type: 'join_room'
  roomId?: string
}
  | {
  type: 'join_race'
  raceId: string
  reconnectToken?: string
}
  | {
  type: 'queue_race'
  hub: string
  mode: string
  capacity: number
  reconnectToken?: string
}
  | {
  type: 'leave_queue'
}
  | {
  type: 'leave_room'
}
  | {
  type: 'start_race'
}
  | {
  type: 'race_input'
  progress: number
  errors: number
} | {
      type: 'confirm_start'
      addBots: boolean
    }
  | {
  type: 'heartbeat'
  reconnectToken?: string
}

export type ParticipantSnapshot = {
  clientId: string
  displayName?: string
  avatarUrl?: string
  progress: number
  errors: number
  grossWpm: number
  netWpm: number
  accuracy: number
  finished: boolean
  isBot?: boolean
}

export type RaceResult = {
  clientId: string
  displayName?: string
  avatarUrl?: string
  position: number
  completionPercent: number
  progress: number
  grossWpm: number
  netWpm: number
  accuracy: number
  errors: number
  finished: boolean
  finishedElapsedMs: number
  suspicious: boolean
  isBot?: boolean
}

export type ServerEvent = {
  type: string
  roomId?: string
  raceId?: string
  clientId?: string
  displayName?: string
  avatarUrl?: string
  sessionToken?: string
  queueKey?: string
  position?: number
  connected?: number
  message?: string
  countdown?: number
  snippet?: string
  snippetLen?: number
  durationMs?: number
  raceDurationMs?: number
  elapsedMs?: number
  participants?: ParticipantSnapshot[]
  results?: RaceResult[]
  leaderId?: string
  yourProgress?: number
}
