import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { RaceResult } from '../../types/race'

function formatTime(ms: number): string {
  if (ms <= 0) return '--'
  const seconds = Math.round(ms / 1000)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export const RaceResults = memo(function RaceResults({ results, replayUrl }: { results: RaceResult[]; replayUrl?: string }) {
  const winner = results[0] ?? null
  const finishedPlayers = results.filter((r) => r.finished)
  const avgWpm = finishedPlayers.length > 0 ? finishedPlayers.reduce((sum, r) => sum + r.netWpm, 0) / finishedPlayers.length : 0
  const avgAccuracy = finishedPlayers.length > 0 ? finishedPlayers.reduce((sum, r) => sum + r.accuracy, 0) / finishedPlayers.length : 0
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0)
  const fastestTime = finishedPlayers.length > 0 ? Math.min(...finishedPlayers.map((r) => r.finishedElapsedMs)) : 0

  return (
    <section className="race-results-panel">
      <div className="race-panel-head">
        <div>
          <h2>Results</h2>
          <p>Server-authoritative finish order</p>
        </div>
        {replayUrl && results.length > 0 ? (
          <Link to={replayUrl} className="race-replay-link">
            View Replay
          </Link>
        ) : null}
      </div>

      {results.length > 0 ? (
        <>
          {winner ? (
            <div className="race-winner-banner race-winner-glow" aria-live="polite">
              <span>Winner</span>
              <strong>
                {winner.displayName || winner.clientId}
                {winner.isBot ? <span className="race-bot-badge">BOT</span> : null}
              </strong>
              <p>
                {winner.netWpm.toFixed(1)} WPM - {winner.accuracy.toFixed(1)}% accuracy
              </p>
            </div>
          ) : null}

          <div className="race-results-summary race-results-enter">
            <div>
              <span>Avg WPM</span>
              <strong>{avgWpm.toFixed(1)}</strong>
            </div>
            <div>
              <span>Avg Accuracy</span>
              <strong>{avgAccuracy.toFixed(1)}%</strong>
            </div>
            <div>
              <span>Fastest</span>
              <strong>{formatTime(fastestTime)}</strong>
            </div>
            <div>
              <span>Total Errors</span>
              <strong>{totalErrors}</strong>
            </div>
          </div>

          <ul className="race-results-list">
            {results.map((result, index) => (
              <li
                key={result.clientId}
                className={result.position === 1 ? 'is-first' : ''}
                style={{ '--row-index': index } as React.CSSProperties}
              >
                <span className="race-result-position">#{result.position}</span>
                <strong>
                  {result.displayName || result.clientId}
                  {result.isBot ? <span className="race-bot-badge">BOT</span> : null}
                </strong>
                <span>{result.completionPercent.toFixed(1)}%</span>
                <span>{result.netWpm.toFixed(1)} WPM</span>
                <span>{result.accuracy.toFixed(1)}%</span>
                <span className="race-result-time">{formatTime(result.finishedElapsedMs)}</span>
                {result.suspicious ? <em>Flagged</em> : null}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="race-empty-text">No finished race yet.</p>
      )}
    </section>
  )
})
