import {useMemo} from 'react'
import type {ProfileActivityCell, ProfileActivityResponse} from './types'

type Props = {
  activity: ProfileActivityResponse
}

function heatClass(count: number): string {
  if (count <= 0) return 'heat-0'
  if (count <= 1) return 'heat-1'
  if (count <= 3) return 'heat-2'
  if (count <= 5) return 'heat-3'
  return 'heat-4'
}

export function ProfileHeatmap({activity}: Props) {
  const weeks = useMemo(() => {
    const chunks: ProfileActivityCell[][] = []
    for (let index = 0; index < activity.cells.length; index += 7) {
      chunks.push(activity.cells.slice(index, index + 7))
    }
    return chunks
  }, [activity.cells])

  return (
    <article className="profile-panel profile-main-card">
      <h3 className="profile-panel-title text-sm sm:text-base">Contribution Activity ({activity.range})</h3>
      <p className="profile-panel-subtitle text-xs sm:text-sm">
        Active days: {activity.totals.activeDays} • Total races: {activity.totals.totalRaces} • Current
        streak: {activity.totals.currentStreak}
      </p>

      <div className="relative mt-2 sm:mt-3">
        <div className="profile-heatmap" role="img" aria-label="Profile activity heatmap">
          {weeks.map((week, weekIndex) => (
            <div key={`profile-week-${weekIndex}`} className="profile-heatmap-week">
              {week.map((cell) => (
                <button
                  key={cell.date}
                  type="button"
                  className={`profile-heatmap-cell ${heatClass(cell.count)}`}
                  data-tooltip={`${cell.date}: ${cell.count} races`}
                  aria-label={`${cell.date}: ${cell.count} races`}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Scroll fade hint for small screens */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[rgba(13,10,9,0.8)] to-transparent sm:hidden rounded-r-xl"/>
      </div>
    </article>
  )
}
