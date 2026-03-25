import type { ProfileAchievement } from './types'

type Props = {
  items: ProfileAchievement[]
}

function badgeLabel(badgeType: ProfileAchievement['badgeType']): string {
  if (badgeType === 'leader') return 'Leader'
  if (badgeType === 'top3') return 'Top 3'
  return 'Top 10'
}

function metricLabel(metricType: string, metricValue: number): string {
  if (metricType === 'wins') {
    return `${metricValue.toFixed(0)} wins`
  }
  if (metricType === 'accuracy') {
    return `${metricValue.toFixed(1)}% accuracy`
  }
  return `${metricValue.toFixed(1)} WPM`
}

export function ProfileAchievements({ items }: Props) {
  return (
    <article className="profile-panel profile-main-card self-start">
      <h3 className="profile-panel-title text-sm sm:text-base">Recent Achievements</h3>
      {items.length === 0 ? <p className="profile-panel-subtitle text-xs sm:text-sm">No monthly top 10 badges yet.</p> : null}
      {items.length > 0 ? (
        <ul className="mt-2 sm:mt-3 grid gap-1.5 sm:gap-2 list-none pl-0">
          {items.map((item) => (
            <li
              key={item.id}
              className="profile-achievement-item grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-start sm:items-center gap-1 sm:gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm"
            >
              <span className={`profile-achievement-badge badge-${item.badgeType} text-[0.58rem] sm:text-[0.64rem]`}>{badgeLabel(item.badgeType)}</span>
              <strong className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[#e7d3be]">{item.hubTitle}</strong>
              <span className="whitespace-nowrap text-[#e7d3be]">{item.periodLabel}</span>
              <span className="whitespace-nowrap text-[#e7d3be]">#{item.rank}</span>
              <span className="whitespace-nowrap text-[#e7d3be]">{metricLabel(item.metricType, item.metricValue)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
