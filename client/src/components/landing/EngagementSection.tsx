import { useEffect, useMemo, useState } from 'react'
import { ButtonLink } from '../ui/ButtonLink'

const activityFeed = [
  {
    title: 'Go hub filled in 11s',
    detail: 'Room GO-22 matched instantly with 5 players and started a clean countdown.',
  },
  {
    title: 'New accuracy record: 99.2%',
    detail: 'A leaderboard run in PHP overtook #2 with fewer than 2 corrections.',
  },
  {
    title: 'PHP sprint room opened',
    detail: 'Fresh mid-difficulty snippets are now active for the next queue cycle.',
  },
  {
    title: '3-player clutch finish on mixed hub',
    detail: 'Top 3 finished within 0.8s, creating one of today\'s closest races.',
  },
  {
    title: 'Daily challenge streak climbed to 9',
    detail: 'Returning players are pushing longer streaks with the 3-race sprint bonus.',
  },
]

function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds)
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  return [h, m, s].map((value) => String(value).padStart(2, '0')).join(':')
}

type EngagementSectionProps = {
  reducedEffects: boolean
  races24h: number
  playersOnline: number
}

export function EngagementSection({ reducedEffects, races24h, playersOnline }: EngagementSectionProps) {
  const [feedIndex, setFeedIndex] = useState(0)
  const [dailyCountdown, setDailyCountdown] = useState(4 * 3600 + 12 * 60 + 33)

  useEffect(() => {
    if (reducedEffects) {
      return
    }

    const tickerInterval = window.setInterval(() => {
      setFeedIndex((current) => (current + 1) % activityFeed.length)
    }, 2600)

    const countdownInterval = window.setInterval(() => {
      setDailyCountdown((current) => (current <= 0 ? 0 : current - 1))
    }, 1000)

    return () => {
      window.clearInterval(tickerInterval)
      window.clearInterval(countdownInterval)
    }
  }, [reducedEffects])

  const feedItem = useMemo(() => activityFeed[feedIndex] ?? activityFeed[0], [feedIndex])

  return (
    <section className="engagement-section animate-in a6" aria-label="Why players come back">
      <div className="engagement-header">
        <p className="engagement-kicker">Why players come back</p>
        <h2>Momentum feels better every day.</h2>
        <p>
          Live rooms, visible progress, and short daily loops keep each return session meaningful.
        </p>
      </div>

      <div className="engagement-grid">
        <article className="engagement-card">
          <div className="engagement-card-title-row">
            <span>Live pulse</span>
            <em>last 24h</em>
          </div>
          <p className="engagement-big-number">{races24h.toLocaleString()}</p>
          <p className="engagement-muted">races in the last 24 hours</p>
          <div className="engagement-mini-stats">
            <span>{playersOnline} online now</span>
          </div>
        </article>

        <article className="engagement-card">
          <div className="engagement-card-title-row">
            <span>Activity feed</span>
            <em>rooms updating</em>
          </div>
          <p className="engagement-feed-item" key={feedItem.title}>
            {feedItem.title}
          </p>
          <p className="engagement-feed-detail">{feedItem.detail}</p>
          <div className="engagement-feed-dots" aria-hidden="true">
            {activityFeed.map((item) => (
              <span key={item.title} className={item.title === feedItem.title ? 'is-active' : ''} />
            ))}
          </div>
        </article>

        <article className="engagement-card">
          <div className="engagement-card-title-row">
            <span>Progress loop</span>
            <em>3 steps</em>
          </div>
          <ol className="engagement-loop">
            <li>
              <strong>Warm-up</strong>
              <span>2 quick snippets to lock rhythm</span>
            </li>
            <li>
              <strong>Race</strong>
              <span>3 focused matches in your best hub</span>
            </li>
            <li>
              <strong>Rank up</strong>
              <span>Daily points + streak bonus progress</span>
            </li>
          </ol>
        </article>

        <article className="engagement-card engagement-cta-card surface-featured-orange">
          <div className="engagement-card-title-row">
            <span>Today's sprint</span>
            <em>return trigger</em>
          </div>
          <div className="engagement-cta-progress" aria-hidden="true">
            <span style={{ width: `${Math.max(6, (dailyCountdown / (4 * 3600 + 12 * 60 + 33)) * 100)}%` }} />
          </div>
          <p className="engagement-big-number engagement-countdown">{formatCountdown(dailyCountdown)}</p>
          <p className="engagement-muted">bonus window until reset</p>
          <div className="engagement-cta-stats">
            <span>+22% XP boost</span>
            <span>3 races to claim</span>
          </div>
          <div className="engagement-cta-actions">
            <ButtonLink to="/hubs" variant="primary">
              Start 3-Race Sprint
            </ButtonLink>
            <ButtonLink to="/leaderboard" variant="secondary">
              Check Rank Delta
            </ButtonLink>
          </div>
        </article>
      </div>
    </section>
  )
}
