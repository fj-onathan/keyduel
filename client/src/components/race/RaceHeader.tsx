import {memo, useState} from 'react'
import {Button} from '../ui/Button'
import {MobileWarningModal} from '../ui/MobileWarningModal'
import {useUIStore} from '../../store/uiStore'
import {useIsMobile} from '../../lib/useIsMobile'

type RacePhase = 'queued' | 'countdown' | 'active' | 'finished'

const phaseLabel: Record<RacePhase, string> = {
  queued: 'Queued',
  countdown: 'Countdown',
  active: 'Live',
  finished: 'Finished',
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const RaceHeader = memo(function RaceHeader({
                                                     raceId: _raceId, // eslint-disable-line @typescript-eslint/no-unused-vars -- reserved for future use
                                                     roomId,
                                                     hub,
                                                     socketState,
                                                     statusMessage,
                                                     phase,
                                                     hud,
                                                     snippetLen,
                                                     playerCount,
                                                     isLeader,
                                                     timeRemainingSeconds,
                                                     isLowTime,
                                                     onJoin,
                                                     onLeaveRoom,
                                                     onStartRace,
                                                     onRaceAgain,
                                                   }: {
  raceId: string
  roomId: string
  hub: string
  socketState: 'idle' | 'connecting' | 'connected' | 'disconnected'
  statusMessage: string
  phase: RacePhase
  hud: {
    rankLabel: string
    netWpmLabel: string
    accuracyLabel: string
    progressLabel: string
  }
  snippetLen: number
  playerCount: number
  isLeader: boolean
  timeRemainingSeconds: number
  isLowTime: boolean
  onJoin: () => void
  onLeaveRoom: () => void
  onStartRace: () => void
  onRaceAgain: () => void
}) {
  const isConnected = socketState === 'connected'
  const isIdle = socketState === 'idle' || socketState === 'disconnected'
  const soundEnabled = useUIStore((state) => state.soundEnabled)
  const toggleSound = useUIStore((state) => state.toggleSound)
  const isMobile = useIsMobile()
  const [mobileWarningOpen, setMobileWarningOpen] = useState(false)

  // "waiting" = joined room, not yet in countdown, not active, not finished
  const isWaiting = phase === 'queued' && isConnected && roomId !== ''

  return (
    <header className="race-header">
      <div className="race-header-top">
        <div className="race-header-hub">
          <p className="race-kicker">Ranked race arena</p>
          <h1>{formatHubName(hub)}</h1>
        </div>
        <div className="race-header-global-stats">
          <span>{playerCount} player{playerCount !== 1 ? 's' : ''}</span>
          <span>{snippetLen} chars</span>
        </div>
      </div>

      <p className="race-status-message">{statusMessage}</p>

      <div className="race-header-chips" aria-label="Race metadata">
        <div className="race-chips-status">
          <span className="race-chip race-chip-room">
            <span className="race-chip-dot"/>
            {roomId ? roomId.slice(0, 8) : 'No room'}
          </span>
          <span className={`race-chip race-chip-socket is-${socketState}`}>
            <span className="race-chip-dot"/>
            {socketState}
          </span>
          <span className={`race-chip race-chip-phase is-${phase}`}>
            <span className="race-chip-dot"/>
            {phaseLabel[phase]}
          </span>
          {isWaiting && isLeader ? (
            <span className="race-chip race-chip-leader">
              <span className="race-chip-dot"/>
              Leader
            </span>
          ) : null}
        </div>
        <div className="race-chips-controls">
          <button
            type="button"
            className={`sound-toggle ${soundEnabled ? 'is-on' : ''}`}
            onClick={toggleSound}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            role="switch"
            aria-checked={soundEnabled}
          >
            <svg className="sound-toggle-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {soundEnabled ? (
                <>
                  <path d="M2 5.5h2.5L8 2.5v11L4.5 10.5H2a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z" fill="currentColor"/>
                  <path d="M10.5 4.5c1.2 1 1.8 2.2 1.8 3.5s-.6 2.5-1.8 3.5" stroke="currentColor" strokeWidth="1.3"
                        strokeLinecap="round"/>
                  <path d="M12.2 2.8c1.8 1.5 2.8 3.4 2.8 5.2s-1 3.7-2.8 5.2" stroke="currentColor" strokeWidth="1.3"
                        strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <path d="M2 5.5h2.5L8 2.5v11L4.5 10.5H2a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5Z" fill="currentColor"/>
                  <path d="M11 5.5l4 5M15 5.5l-4 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </>
              )}
            </svg>
            <span className="sound-toggle-track">
              <span className="sound-toggle-knob"/>
            </span>
            <span className="sound-toggle-label">{soundEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>

      <div className="race-hud-strip" aria-label="Live race HUD">
        <div>
          <span>Rank</span>
          <strong>{hud.rankLabel}</strong>
        </div>
        <div>
          <span>Net WPM</span>
          <strong>{hud.netWpmLabel}</strong>
        </div>
        <div>
          <span>Accuracy</span>
          <strong>{hud.accuracyLabel}</strong>
        </div>
        <div>
          <span>Progress</span>
          <strong>{hud.progressLabel}</strong>
        </div>
        <div className={`race-hud-time${phase === 'active' && isLowTime ? ' race-hud-low-time' : ''}`}>
          <span>Time</span>
          <strong>{phase === 'active' ? formatTime(timeRemainingSeconds) : '--'}</strong>
        </div>
      </div>

      <p className={`race-state-note is-${phase}`}>
        {phase === 'queued' && isIdle ? 'Press Join to enter a live room.' : null}
        {isWaiting && isLeader ? 'You are the leader. Press Start when ready.' : null}
        {isWaiting && !isLeader ? 'Waiting for the leader to start the race...' : null}
        {phase === 'countdown' ? 'Lock in. Race starts in seconds.' : null}
        {phase === 'active' ? 'Race live. Forward-only input is enforced.' : null}
        {phase === 'finished' ? 'Race complete. Review finish order and race again.' : null}
      </p>

      <div className="race-header-actions">
        {phase === 'queued' && isIdle ? (
          <Button variant="primary" onClick={isMobile ? () => setMobileWarningOpen(true) : onJoin}>
            Join Race
          </Button>
        ) : null}
        {isWaiting && isLeader ? (
          <Button variant="primary" onClick={onStartRace}>
            Start Race
          </Button>
        ) : null}
        {isWaiting ? (
          <Button onClick={onLeaveRoom}>Leave Room</Button>
        ) : null}
        {phase === 'finished' ? (
          <Button variant="primary" onClick={isMobile ? () => setMobileWarningOpen(true) : onRaceAgain}>
            Race Again
          </Button>
        ) : null}
      </div>

      <MobileWarningModal
        open={mobileWarningOpen}
        onClose={() => setMobileWarningOpen(false)}
      />
    </header>
  )
})
