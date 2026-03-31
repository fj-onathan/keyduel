import {useEffect, useMemo, useState} from 'react'
import {HubCard} from '../components/hubs/HubCard'
import {HubsHero} from '../components/hubs/HubsHero'
import {type HubsLanguageTag, HubsTagRow} from '../components/hubs/HubsTagRow'
import {apiGet} from '../lib/api'

type HubItem = {
  id: string
  slug: string
  language: string
  title: string
  isRanked: boolean
  isActive: boolean
  activePlayers: number
  snippetsTotal: number
  racesToday: number
  leaderToday: {
    username: string
    value: number
    metric: 'wins' | 'speed'
  } | null
}

type HubsResponse = {
  items: HubItem[]
  total?: number
  limit?: number
  offset?: number
  hasMore?: boolean
}

const PAGE_SIZE = 30

const POPULAR_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'go',
  'rust',
  'java',
  'c++',
  'c#',
  'ruby',
  'php',
]

export function HubsPage() {
  const [allHubs, setAllHubs] = useState<HubItem[]>([])
  const [allHubsLoaded, setAllHubsLoaded] = useState(false)
  const [items, setItems] = useState<HubItem[]>([])
  const [gridLoading, setGridLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [reloadTick, setReloadTick] = useState(0)

  // Fetch all hubs once (unfiltered) for featured section, tags, and summary stats
  useEffect(() => {
    const controller = new AbortController()

    void apiGet<HubsResponse>('/hubs?activeOnly=true', {signal: controller.signal})
      .then((payload) => {
        setAllHubs(payload.items)
        setAllHubsLoaded(true)
      })
      .catch(() => {
        // Errors are handled by the filtered fetch below
      })

    return () => {
      controller.abort()
    }
  }, [reloadTick])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset page on filter change
    setPage(1)
  }, [query, selectedLanguage])

  // Fetch filtered/paginated hubs for the "All hubs" grid
  useEffect(() => {
    const controller = new AbortController()
    const offset = (page - 1) * PAGE_SIZE
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
      activeOnly: 'true',
    })

    const normalizedQuery = query.trim()
    if (normalizedQuery !== '') {
      params.set('q', normalizedQuery)
    }
    if (selectedLanguage !== 'all') {
      params.set('language', selectedLanguage)
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state before async fetch
    setGridLoading(true)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError('')

    void apiGet<HubsResponse>(`/hubs?${params.toString()}`, {signal: controller.signal})
      .then((payload) => {
        setItems(payload.items)
        setTotal(payload.total ?? payload.items.length)
        setLimit(payload.limit ?? PAGE_SIZE)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setError(err instanceof Error ? err.message : 'Failed to load hubs')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setGridLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [page, query, selectedLanguage, reloadTick])

  const summary = useMemo(() => {
    const totalHubs = allHubs.length
    const rankedHubs = allHubs.filter((hub) => hub.isRanked).length
    const totalOnline = allHubs.reduce((sum, hub) => sum + hub.activePlayers, 0)
    const totalRacesToday = allHubs.reduce((sum, hub) => sum + hub.racesToday, 0)
    const topLanguage =
      allHubs
        .slice()
        .sort((a, b) => b.activePlayers - a.activePlayers || b.racesToday - a.racesToday)[0]
        ?.language ?? 'n/a'

    return {totalHubs, rankedHubs, totalOnline, totalRacesToday, topLanguage}
  }, [allHubs])

  const languageTags: HubsLanguageTag[] = useMemo(() => {
    const onlineByLanguage = new Map<string, number>()
    allHubs.forEach((hub) => {
      const lang = hub.language.toLowerCase()
      onlineByLanguage.set(lang, (onlineByLanguage.get(lang) ?? 0) + hub.activePlayers)
    })

    return POPULAR_LANGUAGES.map((language) => {
      const online = onlineByLanguage.get(language) ?? 0
      return {
        value: language,
        label: language,
        online,
        hot: online > 0,
      }
    })
  }, [allHubs])

  const allHubsByActivity = useMemo(
    () => allHubs.slice().sort((a, b) => b.activePlayers - a.activePlayers || b.racesToday - a.racesToday || a.title.localeCompare(b.title)),
    [allHubs],
  )

  const featuredHubs = allHubsByActivity.slice(0, 2)

  const gridItems = useMemo(
    () => items.slice().sort((a, b) => b.activePlayers - a.activePlayers || b.racesToday - a.racesToday || a.title.localeCompare(b.title)),
    [items],
  )
  const maxActivePlayers = Math.max(...allHubsByActivity.map((hub) => hub.activePlayers), 0)
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)))
  const pageNumbers = useMemo(() => {
    const windowSize = 5
    let start = Math.max(1, page - Math.floor(windowSize / 2))
    const end = Math.min(totalPages, start + windowSize - 1)
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1)
    }

    return Array.from({length: end - start + 1}, (_, index) => start + index)
  }, [page, totalPages])

  const hasQuery = query.trim().length > 0
  const isEmpty = !gridLoading && !error && items.length === 0

  return (
    <main className="layout mx-auto max-w-7xl px-6">
      <section className="hubs-hero">
        <HubsHero
          query={query}
          onQueryChange={setQuery}
          onClearQuery={() => setQuery('')}
          totalHubs={summary.totalHubs}
          rankedHubs={summary.rankedHubs}
          totalOnline={summary.totalOnline}
          totalRacesToday={summary.totalRacesToday}
          topLanguage={summary.topLanguage}
        />

        <HubsTagRow
          tags={languageTags}
          selected={selectedLanguage}
          onSelect={setSelectedLanguage}
          disabled={gridLoading}
        />
      </section>

      {allHubsLoaded ? (
        <section className="hubs-overview-rail" aria-label="Live hub overview">
          <article className="hubs-overview-item hubs-overview-item-live hub-card-featured surface-featured-orange">
            <span>Live queue</span>
            <strong>{summary.totalOnline}</strong>
          </article>
          <article className="hubs-overview-item hubs-overview-item-duels hub-card-featured surface-featured-orange">
            <span>Duels today</span>
            <strong>{summary.totalRacesToday}</strong>
          </article>
          <article className="hubs-overview-item hubs-overview-item-language hub-card-featured surface-featured-orange">
            <span>Hot language</span>
            <strong>{summary.topLanguage}</strong>
          </article>
          <article className="hubs-overview-item hubs-overview-item-ranked hub-card-featured surface-featured-orange">
            <span>Ranked hubs</span>
            <strong>{summary.rankedHubs}</strong>
          </article>
        </section>
      ) : null}

      {allHubsLoaded && !error && featuredHubs.length > 0 ? (
        <section className="hubs-showcase" aria-label="Featured hubs">
          <header className="hubs-section-head">
            <p className="hubs-section-kicker">Featured hubs</p>
            <h2>Most active right now</h2>
            <p>Top live arenas with the hottest queues right now. Jump in for faster starts and tougher duels.</p>
          </header>

          <div className="hubs-featured-grid">
            {featuredHubs.map((hub) => (
              <HubCard
                key={hub.id}
                hub={hub}
                featured
                featuredTone="white"
                maxActivePlayers={maxActivePlayers}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!error ? (
        <section aria-label="All hubs">
          <header className="hubs-section-head hubs-section-head-list">
            <p className="hubs-section-kicker">All hubs</p>
            <h2>Browse every available arena</h2>
            <p>
              You can browse through <strong>{total}</strong> hubs and pick the language queue that fits
              your next duel.
            </p>
          </header>

          {gridLoading ? (
            <div className="hubs-grid">
              {Array.from({length: 6}).map((_, index) => (
                <article key={index} className="hub-card hub-card-skeleton" aria-hidden="true">
                  <div className="hub-card-skeleton-line hub-card-skeleton-line-long"/>
                  <div className="hub-card-skeleton-line hub-card-skeleton-line-short"/>
                  <div className="hub-card-skeleton-grid">
                    <div className="hub-card-skeleton-line hub-card-skeleton-line-mid"/>
                    <div className="hub-card-skeleton-line hub-card-skeleton-line-small"/>
                    <div className="hub-card-skeleton-line hub-card-skeleton-line-mid"/>
                    <div className="hub-card-skeleton-line hub-card-skeleton-line-small"/>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="hubs-grid">
              {gridItems.map((hub) => (
                <HubCard key={hub.id} hub={hub} maxActivePlayers={maxActivePlayers}/>
              ))}
            </div>
          )}

          <div className="hubs-pagination" aria-label="Hubs pagination">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1 || gridLoading}>
              Previous
            </button>
            <div className="hubs-pagination-pages" role="group" aria-label="Page numbers">
              {pageNumbers[0] > 1 ? (
                <>
                  <button type="button" onClick={() => setPage(1)} disabled={gridLoading}>
                    1
                  </button>
                  {pageNumbers[0] > 2 ? <span aria-hidden="true">...</span> : null}
                </>
              ) : null}

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  disabled={gridLoading}
                  className={pageNumber === page ? 'is-active' : ''}
                  aria-current={pageNumber === page ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages ? (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 ? <span aria-hidden="true">...</span> : null}
                  <button type="button" onClick={() => setPage(totalPages)} disabled={gridLoading}>
                    {totalPages}
                  </button>
                </>
              ) : null}
            </div>
            <p>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </p>
            <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages || gridLoading}>
              Next
            </button>
          </div>
        </section>
      ) : null}

      {error ? (
        <section className="hubs-feedback" role="alert">
          <h2>Could not load hubs</h2>
          <p>{error}</p>
          <button type="button" className="hubs-retry" onClick={() => setReloadTick((current) => current + 1)}>
            Retry
          </button>
        </section>
      ) : null}

      {isEmpty ? (
        <section className="hubs-feedback">
          <h2>No hubs match your filters</h2>
          <p>
            {hasQuery ? `No results for "${query.trim()}".` : 'No hubs available with this filter.'} Try another
            language tag or clear search.
          </p>
        </section>
      ) : null}
    </main>
  )
}
