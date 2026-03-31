import {useEffect, useMemo, useRef, useState} from 'react'
import {ButtonLink} from '../ui/ButtonLink'
import {apiGet} from '../../lib/api'
import {getShowcaseHeatmap, showcaseProfile,} from './mockProfileLeaderboardData'

type LeaderboardPeriod = 'weekly' | 'all-time'

type ApiLeaderboardEntry = {
  userId: string
  username: string
  avatarUrl?: string
  displayName?: string
  rank: number
  rankDelta: number
  metricType: string
  metricValue: number
  wins: number
  racesPlayed: number
  bestNetWpm: number
  avgAccuracy: number
}

type ApiLeaderboardResponse = {
  items: ApiLeaderboardEntry[]
}

type HubItem = {
  id: string
  slug: string
  title: string
}

type HubsResponse = {
  items: HubItem[]
}

function heatClass(count: number): string {
  if (count <= 0) return 'heat-0'
  if (count <= 1) return 'heat-1'
  if (count <= 3) return 'heat-2'
  if (count <= 5) return 'heat-3'
  return 'heat-4'
}

export function ProfileLeaderboardSection() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const [hub, setHub] = useState('all')
  const [entries, setEntries] = useState<ApiLeaderboardEntry[]>([])
  const [hubs, setHubs] = useState<HubItem[]>([])
  const [loading, setLoading] = useState(true)
  const controllerRef = useRef<AbortController | null>(null)

  // Fetch hubs once on mount
  useEffect(() => {
    apiGet<HubsResponse>('/hubs?limit=200&offset=0&activeOnly=true')
      .then((data) => {
        setHubs(data.items)
      })
      .catch(() => {
        // Silently fail
      })
  }, [])

  // Fetch leaderboard entries when period or hub changes
  useEffect(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    const hubParam = hub !== 'all' ? `/${hub}` : ''
    apiGet<ApiLeaderboardResponse>(
      `/leaderboard${hubParam}?metric=speed&range=${period}&limit=6&offset=0`,
      {signal: controller.signal},
    )
      .then((data) => {
        if (!controller.signal.aborted) {
          setEntries(data.items)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [period, hub])

  const heatmap = useMemo(() => getShowcaseHeatmap(), [])

  return (
    <section className="profile-leaderboard-section spacious-section" aria-label="Profile and leaderboard preview">
      <div className="px-2 text-center sm:px-0">
        <h2
          className="mx-auto max-w-4xl font-sans text-2xl font-semibold tracking-tight text-[#fff0e2] sm:text-3xl md:text-5xl">
          Track your profile. Climb every board.
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-[#cbb9a7] md:text-base">
          Review daily race activity, compare leaderboard movement, and improve by language hub.
        </p>
      </div>

      <div className="profile-leaderboard-grid">
        <article className="profile-card-preview animate-in a4">
          <div className="profile-card-header">
            <img src={showcaseProfile.avatar} alt="Showcase player avatar" className="profile-avatar"/>
            <div>
              <p className="profile-name">{showcaseProfile.name}</p>
              <div className="profile-tags">
                <span>{showcaseProfile.rankLabel}</span>
                <span>{showcaseProfile.primaryHub}</span>
              </div>
            </div>
          </div>

          <div className="profile-metrics">
            <div>
              <span>Net WPM</span>
              <strong>{showcaseProfile.netWpm}</strong>
            </div>
            <div>
              <span>Accuracy</span>
              <strong>{showcaseProfile.accuracy}</strong>
            </div>
            <div>
              <span>Win Rate</span>
              <strong>{showcaseProfile.winRate}</strong>
            </div>
            <div>
              <span>Streak</span>
              <strong>{showcaseProfile.streak}</strong>
            </div>
          </div>

          <div className="profile-heatmap" role="img" aria-label="Player activity heatmap">
            {heatmap.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="profile-heatmap-week">
                {week.map((cell) => (
                  <button
                    key={cell.label}
                    type="button"
                    className={`profile-heatmap-cell ${heatClass(cell.count)}`}
                    data-tooltip={cell.label}
                    aria-label={cell.label}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="profile-heatmap-legend" aria-hidden="true">
            <span>Less</span>
            <div className="profile-heatmap-legend-scale">
              <i className="heat-0"/>
              <i className="heat-1"/>
              <i className="heat-2"/>
              <i className="heat-3"/>
              <i className="heat-4"/>
            </div>
            <span>More</span>
          </div>

          <div className="profile-summary-lines">
            <p>Most active hub: {showcaseProfile.mostActiveHub}</p>
            <p>Best race day: {showcaseProfile.bestDay}</p>
            <p>Races this month: {showcaseProfile.monthRaces}</p>
          </div>
        </article>

        <article className="leaderboard-card-preview animate-in a5">
          <div className="leaderboard-controls">
            <div className="leaderboard-period-tabs" role="tablist" aria-label="Leaderboard period">
              <button
                type="button"
                className={period === 'weekly' ? 'is-active' : ''}
                onClick={() => setPeriod('weekly')}
              >
                Weekly
              </button>
              <button
                type="button"
                className={period === 'all-time' ? 'is-active' : ''}
                onClick={() => setPeriod('all-time')}
              >
                All-Time
              </button>
            </div>

            {hubs.length > 0 ? (
              <div className="leaderboard-hub-picker" role="group" aria-label="Hub filter">
                <div className="leaderboard-hub-select-wrap">
                  <select
                    value={hub}
                    onChange={(event) => setHub(event.target.value)}
                    className="leaderboard-hub-select"
                    aria-label="Filter by hub"
                  >
                    <option value="all">All hubs</option>
                    {hubs.map((item) => (
                      <option key={item.id} value={item.slug}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                  <span className="leaderboard-hub-select-arrow" aria-hidden="true">
                    v
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="leaderboard-table-shell overflow-hidden">
            <div className="leaderboard-row-header" role="row">
              <span>#</span>
              <span>Player</span>
              <span>WPM</span>
              <span>Acc</span>
              <span className="leaderboard-races">Races</span>
              <span>Delta</span>
            </div>

            <div className="leaderboard-rows" role="table" aria-label="Leaderboard preview" key={`${period}-${hub}`}>
              {loading ? (
                <div className="leaderboard-preview-loading">Loading...</div>
              ) : entries.length > 0 ? (
                entries.map((row) => (
                  <div key={row.userId} className="leaderboard-row" role="row">
                    <span className="leaderboard-rank" role="cell">
                      #{row.rank}
                    </span>
                    <span className="leaderboard-player truncate" role="cell">
                      <span className="leaderboard-player-info">
                        {row.avatarUrl ? (
                          <img src={row.avatarUrl} alt={row.username} className="leaderboard-preview-avatar"/>
                        ) : (
                          <span
                            className="leaderboard-preview-avatar-placeholder">{row.username.charAt(0).toUpperCase()}</span>
                        )}
                        <span className="leaderboard-player-names">
                          <strong>@{row.username}</strong>
                          {row.displayName ? <small>{row.displayName}</small> : null}
                        </span>
                      </span>
                    </span>
                    <span className="leaderboard-score" role="cell">
                      {row.bestNetWpm.toFixed(1)}
                    </span>
                    <span className="leaderboard-acc" role="cell">
                      {row.avgAccuracy.toFixed(1)}%
                    </span>
                    <span className="leaderboard-races" role="cell">
                      {row.racesPlayed}
                    </span>
                    <span
                      className={`leaderboard-delta ${row.rankDelta > 0 ? 'is-up' : row.rankDelta < 0 ? 'is-down' : 'is-flat'}`}
                      role="cell">
                      {row.rankDelta > 0 ? `+${row.rankDelta}` : row.rankDelta}
                    </span>
                  </div>
                ))
              ) : (
                <div className="leaderboard-preview-empty">No leaderboard data yet. Race to claim a spot!</div>
              )}
            </div>
          </div>

          <div className="leaderboard-footer">
            <ButtonLink to="/leaderboard" variant="secondary">
              View Full Leaderboard
            </ButtonLink>
          </div>
        </article>
      </div>
    </section>
  )
}
