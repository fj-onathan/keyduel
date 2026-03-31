import {useEffect, useRef} from 'react'

type HubsHeroProps = {
  query: string
  onQueryChange: (value: string) => void
  onClearQuery: () => void
  totalHubs: number
  rankedHubs: number
  totalOnline: number
  totalRacesToday: number
  topLanguage: string
}

export function HubsHero({
                           query,
                           onQueryChange,
                           onClearQuery,
                           totalHubs,
                           rankedHubs,
                           totalOnline,
                           totalRacesToday,
                           topLanguage,
                         }: HubsHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/') {
        return
      }

      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      event.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="hubs-hero-shell">
      <p className="hubs-kicker">Find your next duel</p>
      <h1 className="hubs-title">Search language hubs</h1>
      <p className="hubs-subtitle">Find the right queue in seconds. Filter by language and jump straight into live
        races.</p>

      <div className="hubs-search-wrap">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="hubs-search-input"
          placeholder="Search hubs or languages..."
          type="text"
          aria-label="Search hubs or languages"
        />
        <span className="hubs-search-shortcut" aria-hidden="true">
          /
        </span>
        {query.trim().length > 0 ? (
          <button type="button" className="hubs-search-clear" onClick={onClearQuery}>
            Clear
          </button>
        ) : null}
      </div>

      <div className="hubs-summary-row" aria-label="Hub summary">
        <span>
          <strong>{totalHubs}</strong> hubs
        </span>
        <span>
          <strong>{rankedHubs}</strong> ranked
        </span>
        <span>
          <strong>{totalOnline}</strong> players online
        </span>
        <span>
          <strong>{totalRacesToday}</strong> duels today
        </span>
        <span>
          <strong>{topLanguage}</strong> hottest language
        </span>
      </div>
    </div>
  )
}
