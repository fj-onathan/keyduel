import type {ProfileOverviewResponse} from './types'

type Props = {
  curriculum: ProfileOverviewResponse['curriculum']
}

export function ProfileCurriculum({curriculum}: Props) {
  const skills = curriculum.skills ?? []
  const items = curriculum.items ?? []

  const renderItem = (item: Record<string, unknown>) => {
    const title = typeof item.title === 'string' ? item.title : 'Entry'
    const org = typeof item.org === 'string' ? item.org : ''
    const period = typeof item.period === 'string' ? item.period : ''
    const description = typeof item.description === 'string' ? item.description : ''

    return [title, org, period].filter(Boolean).join(' • ') + (description ? ` — ${description}` : '')
  }

  return (
    <article className="profile-panel profile-main-card">
      <h3 className="profile-panel-title text-sm sm:text-base">About & Experience</h3>

      {skills.length > 0 ? (
        <p className="profile-panel-subtitle text-xs sm:text-sm">Skills: {skills.join(', ')}</p>
      ) : (
        <p className="profile-panel-subtitle text-xs sm:text-sm">No skills set yet.</p>
      )}

      {items.length > 0 ? (
        <ul className="mt-2 sm:mt-3 pl-0 grid gap-1.5 sm:gap-2">
          {items.slice(0, 6).map((item, index) => (
            <li
              key={`curriculum-item-${index}`}
              className="profile-curriculum-list-item list-none border-l-2 border-accent/50 pl-2.5 sm:pl-3 text-xs sm:text-sm text-[#e7d3be] leading-relaxed"
            >
              {renderItem(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="profile-panel-subtitle text-xs sm:text-sm">No curriculum entries yet.</p>
      )}
    </article>
  )
}
