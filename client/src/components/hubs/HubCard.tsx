import {CodeIcon} from '@sanity/icons'
import {GoLight, JavaScript, PhpLight} from '@ridemountainpig/svgl-react'
import {Link} from 'react-router-dom'

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

export function HubCard({
                          hub,
                          featured = false,
                          featuredTone = 'default',
                          maxActivePlayers = 0,
                        }: {
  hub: HubItem
  featured?: boolean
  featuredTone?: 'default' | 'cta' | 'white'
  maxActivePlayers?: number
}) {
  const leaderLabel = hub.leaderToday
    ? hub.leaderToday.metric === 'wins'
      ? `${hub.leaderToday.username} (${hub.leaderToday.value.toFixed(0)}W)`
      : `${hub.leaderToday.username} (${hub.leaderToday.value.toFixed(1)} WPM)`
    : '--'

  const languageKey = hub.language.trim().toLowerCase()

  const logo = (() => {
    if (languageKey === 'go') {
      return <GoLight aria-label="Go logo"/>
    }
    if (languageKey === 'php') {
      return <PhpLight aria-label="PHP logo"/>
    }
    if (languageKey === 'javascript' || languageKey === 'js') {
      return <JavaScript aria-label="JavaScript logo"/>
    }

    return <CodeIcon aria-label="Language icon"/>
  })()

  const intensity = maxActivePlayers > 0 ? Math.max(8, Math.round((hub.activePlayers / maxActivePlayers) * 100)) : 8

  const featuredToneClass =
    featuredTone === 'cta' ? 'surface-featured-cta' : featuredTone === 'white' ? 'surface-featured-white' : 'surface-featured-orange'

  return (
    <article
      className={`hub-card ${featured ? `hub-card-featured ${featuredToneClass}` : ''}`.trim()}
    >
      <div className="hub-card-activity" aria-hidden="true">
        <span style={{width: `${intensity}%`}}/>
      </div>

      <div className="hub-card-top">
        <div className="hub-card-heading">
          <span className="hub-card-logo" aria-hidden="true">
            {logo}
          </span>
          <h2>{hub.title}</h2>
        </div>
        <div className="hub-card-pills">
          <span className="hub-pill hub-pill-language">{hub.language}</span>
          <span className={`hub-pill ${hub.isRanked ? 'hub-pill-ranked' : 'hub-pill-casual'}`}>
            {hub.isRanked ? 'Ranked' : 'Casual'}
          </span>
          <span className={`hub-pill ${hub.isActive ? 'hub-pill-active' : 'hub-pill-inactive'}`}>
            {hub.isActive ? 'Active' : 'Offline'}
          </span>
        </div>
      </div>

      {featured ? (
        <p className="hub-card-flavor">Most active right now. Great pick for quick matches and leaderboard climbing.</p>
      ) : null}

      <div className="hub-card-stats">
        <div>
          <span>Players online</span>
          <strong className={hub.activePlayers === 0 ? 'hub-stat-value-zero' : undefined}>{hub.activePlayers}</strong>
        </div>
        <div>
          <span>Total snippets</span>
          <strong>{hub.snippetsTotal}</strong>
        </div>
        <div>
          <span>Leader today</span>
          <strong>{leaderLabel}</strong>
        </div>
        <div>
          <span>Races today</span>
          <strong>{hub.racesToday}</strong>
        </div>
      </div>

      <div className="hub-card-actions">
        <Link to={`/race/${hub.slug}`} className="hub-card-action-primary">
          Start Race
        </Link>
        <Link to={`/leaderboard/${hub.slug}`} className="hub-card-action-secondary">
          Leaderboard
        </Link>
      </div>
    </article>
  )
}
