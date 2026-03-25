import type { HubStat } from '../../lib/api'

export function HubStatsSection({
  stats,
  loading,
}: {
  stats: HubStat[]
  loading: boolean
}) {
  if (loading) {
    return (
      <section className="dashboard-section" aria-label="Hub Stats">
        <h2>Hub Stats</h2>
        <div className="dashboard-loading">Loading hub stats...</div>
      </section>
    )
  }

  return (
    <section className="dashboard-section" aria-label="Hub Stats">
      <h2>Hub Stats</h2>

      {stats.length === 0 ? (
        <p className="dashboard-empty">
          No hub stats yet. Complete a few races to see your per-hub performance.
        </p>
      ) : (
        <div className="dashboard-table dashboard-table--hubs" role="table" aria-label="Hub stats table">
          <div className="dashboard-table-header dashboard-table-header--hubs" role="row">
            <span role="columnheader">Hub</span>
            <span role="columnheader">Races</span>
            <span role="columnheader">Wins</span>
            <span role="columnheader">Avg WPM</span>
            <span role="columnheader">Best WPM</span>
            <span role="columnheader">Avg Accuracy</span>
          </div>
          <div className="dashboard-table-body">
            {stats.map((hub) => (
              <article key={hub.slug} className="dashboard-table-row dashboard-table-row--hubs" role="row">
                <span role="cell" className="hub-name-cell">{hub.title}</span>
                <span role="cell">{hub.racesPlayed}</span>
                <span role="cell">{hub.wins}</span>
                <span role="cell">{hub.avgWpm.toFixed(1)}</span>
                <span role="cell">{hub.bestWpm.toFixed(1)}</span>
                <span role="cell">{hub.avgAccuracy.toFixed(1)}%</span>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
