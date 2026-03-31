import {memo, useMemo} from 'react'
import type {ParticipantSnapshot} from '../../types/race'

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function orangeHue(clientId: string): number {
  return 20 + (hashCode(clientId) % 16)
}

function avatarInitial(participant: ParticipantSnapshot): string {
  const name = participant.displayName || participant.clientId
  const clean = name.replace(/^(client-|bot_|guest-)/, '')
  return clean.charAt(0).toUpperCase() || '?'
}

function participantLabel(participant: ParticipantSnapshot): string {
  return participant.displayName || participant.clientId
}

export const RaceStandings = memo(function RaceStandings({
                                                           participants,
                                                           clientId,
                                                           snippetLength,
                                                           phase,
                                                         }: {
  participants: ParticipantSnapshot[]
  clientId: string
  snippetLength: number
  phase: 'queued' | 'countdown' | 'active' | 'finished'
}) {
  const avgNetWpm = participants.length > 0 ? participants.reduce((sum, p) => sum + p.netWpm, 0) / participants.length : 0
  const avgAccuracy = participants.length > 0 ? participants.reduce((sum, p) => sum + p.accuracy, 0) / participants.length : 0
  const activeCount = participants.filter((participant) => participant.progress > 0 || participant.finished).length
  const leader = participants[0] ?? null
  const self = participants.find((participant) => participant.clientId === clientId) ?? null
  const delta = leader && self ? leader.netWpm - self.netWpm : 0

  // Stabilize hueMap: only recompute when participant IDs change, not on every
  // progress/wpm update (participants array ref changes every 100ms).
  const participantIds = useMemo(() => participants.map((p) => p.clientId).join(','), [participants])
  const hueMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const id of participantIds.split(',')) {
      if (id) {
        map[id] = orangeHue(id)
      }
    }
    return map
  }, [participantIds])

  return (
    <section className="race-standings-panel">
      <div className="race-panel-head">
        <h2>Live Standings</h2>
        <p>Sorted by finish, progress, net WPM</p>
      </div>

      <div className="race-standings-metrics" aria-label="Standings summary metrics">
        <div>
          <span>avg wpm</span>
          <strong>{avgNetWpm.toFixed(1)}</strong>
        </div>
        <div>
          <span>accuracy</span>
          <strong>{avgAccuracy.toFixed(1)}%</strong>
        </div>
        <div>
          <span>active</span>
          <strong>
            {activeCount}/{participants.length}
          </strong>
        </div>
        <div>
          <span>delta</span>
          <strong>{self ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}` : '--'}</strong>
        </div>
      </div>

      {participants.length > 0 ? (
        <ul className="race-standings-list">
          {participants.map((participant, index) => {
            const isSelf = participant.clientId === clientId
            const width = snippetLength > 0 ? Math.min(100, Math.round((participant.progress / snippetLength) * 100)) : 0
            const isWinner = phase === 'finished' && index === 0
            const hue = hueMap[participant.clientId] ?? 27
            const label = participantLabel(participant)

            return (
              <li
                key={participant.clientId}
                className={`race-lane ${isSelf ? 'is-self' : ''} ${isWinner ? 'is-winner' : ''} ${participant.finished ? 'is-finished' : ''}`.trim()}
                style={{'--lane-index': index} as React.CSSProperties}
              >
                <div className="race-lane-meta">
                  <span className="race-lane-identity">
                    {participant.avatarUrl ? (
                      <img
                        className="race-lane-avatar"
                        src={participant.avatarUrl}
                        alt={label}
                        width={28}
                        height={28}
                      />
                    ) : (
                      <span
                        className="race-lane-avatar"
                        style={{backgroundColor: `hsl(${hue}, 72%, 42%)`}}
                      >
                        {avatarInitial(participant)}
                      </span>
                    )}
                    #{index + 1} {label}
                    {isSelf ? <em>You</em> : null}
                    {isWinner ? <b>Winner</b> : null}
                  </span>
                  <span>
                    {participant.netWpm.toFixed(1)} WPM | {participant.accuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="race-lane-track">
                  <div
                    className="race-lane-progress"
                    style={{
                      width: `${width}%`,
                      background: `linear-gradient(120deg, hsl(${hue}, 80%, 48%), hsl(${hue}, 90%, 58%))`,
                    }}
                  />
                </div>
                <div className="race-lane-extra">
                  <span>{width}% progress</span>
                  <span>{participant.errors} errors</span>
                  <span>{participant.finished ? 'finished' : 'racing'}</span>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="race-empty-text">No participants yet.</p>
      )}
    </section>
  )
})
