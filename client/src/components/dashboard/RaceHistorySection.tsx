import { useMemo, useState } from 'react'
import type { MyRaceItem } from '../../lib/api'

const PAGE_SIZE = 15

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function resultLabel(reason: string, position: number): string {
  if (reason === 'completed') {
    return position === 1 ? '1st' : `#${position}`
  }
  if (reason === 'timeout') return 'Timeout'
  if (reason === 'disconnected') return 'DC'
  return reason
}

function resultClass(reason: string, position: number): string {
  if (reason === 'completed' && position === 1) return 'result-win'
  if (reason === 'completed') return 'result-finish'
  return 'result-dnf'
}

export function RaceHistorySection({
  races,
  total,
  loading,
}: {
  races: MyRaceItem[]
  total: number
  loading: boolean
}) {
  const [tablePage, setTablePage] = useState(1)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  )

  const pagedRows = useMemo(() => {
    const start = (tablePage - 1) * PAGE_SIZE
    return races.slice(start, start + PAGE_SIZE)
  }, [tablePage, races])

  const pageNumbers = useMemo(() => {
    const windowSize = 5
    let start = Math.max(1, tablePage - Math.floor(windowSize / 2))
    const end = Math.min(totalPages, start + windowSize - 1)
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1)
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [tablePage, totalPages])

  if (loading) {
    return (
      <section className="dashboard-section" aria-label="Race History">
        <h2>Race History</h2>
        <div className="dashboard-loading">Loading race history...</div>
      </section>
    )
  }

  return (
    <section className="dashboard-section" aria-label="Race History">
      <header className="dashboard-section-header">
        <h2>Race History</h2>
        <span className="dashboard-section-count">{total} races</span>
      </header>

      {races.length === 0 ? (
        <p className="dashboard-empty">No races yet. Jump into a hub and start typing!</p>
      ) : (
        <>
          <div className="dashboard-table" role="table" aria-label="Race history table">
            <div className="dashboard-table-header" role="row">
              <span role="columnheader">Date</span>
              <span role="columnheader">Hub</span>
              <span role="columnheader">WPM</span>
              <span role="columnheader">Accuracy</span>
              <span role="columnheader">Errors</span>
              <span role="columnheader">Result</span>
            </div>
            <div className="dashboard-table-body">
              {pagedRows.map((race) => (
                <article key={race.raceId} className="dashboard-table-row" role="row">
                  <span role="cell" title={formatTime(race.startedAt)}>
                    {formatDate(race.createdAt)}
                  </span>
                  <span role="cell" title={race.hubTitle}>{race.hubTitle}</span>
                  <span role="cell">{race.netWpm.toFixed(1)}</span>
                  <span role="cell">{race.accuracy.toFixed(1)}%</span>
                  <span role="cell">{race.errorsCount}</span>
                  <span role="cell" className={resultClass(race.finishReason, race.finalPosition)}>
                    {resultLabel(race.finishReason, race.finalPosition)}
                  </span>
                </article>
              ))}
            </div>
          </div>

          {totalPages > 1 ? (
            <div className="dashboard-pagination" aria-label="Race history pagination">
              <button
                type="button"
                onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                disabled={tablePage <= 1}
              >
                Previous
              </button>
              <div className="dashboard-pagination-pages" role="group">
                {pageNumbers[0] > 1 ? (
                  <>
                    <button type="button" onClick={() => setTablePage(1)}>1</button>
                    {pageNumbers[0] > 2 ? <span aria-hidden="true">...</span> : null}
                  </>
                ) : null}

                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTablePage(num)}
                    className={num === tablePage ? 'is-active' : ''}
                    aria-current={num === tablePage ? 'page' : undefined}
                  >
                    {num}
                  </button>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages ? (
                  <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 ? (
                      <span aria-hidden="true">...</span>
                    ) : null}
                    <button type="button" onClick={() => setTablePage(totalPages)}>
                      {totalPages}
                    </button>
                  </>
                ) : null}
              </div>
              <p>
                Page <strong>{tablePage}</strong> of <strong>{totalPages}</strong>
              </p>
              <button
                type="button"
                onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                disabled={tablePage >= totalPages}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
