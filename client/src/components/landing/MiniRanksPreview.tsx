import type {RanksPreviewData} from './types'

const CATEGORIES = ['speed', 'accuracy', 'wins']

export function MiniRanksPreview({data}: { data: RanksPreviewData }) {
  const {ranks, isSettled, isVisible} = data

  if (!isVisible) return <div className="mini-ranks-wrap"/>

  return (
    <div className="mini-ranks-wrap is-visible">
      {ranks.map((rank, i) => {
        let cls = 'mini-rank-anim'
        if (rank.isClimbing) cls += ' is-climbing'
        if (isSettled) cls += ' is-settled'

        return (
          <div key={CATEGORIES[i]} className={cls} style={{animationDelay: `${i * 70}ms`}}>
            <div className="mini-rank-number-wrap">
              <strong className={rank.isClimbing ? 'mini-rank-value is-changing' : 'mini-rank-value'}>
                #{rank.value}
              </strong>
            </div>
            {rank.isClimbing && <span className="mini-rank-arrow" aria-hidden="true">▲</span>}
            <span className="mini-rank-label">{CATEGORIES[i]}</span>
          </div>
        )
      })}
    </div>
  )
}
