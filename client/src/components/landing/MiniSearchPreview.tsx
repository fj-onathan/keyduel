import type {SearchPreviewData} from './types'

const PILLS = ['go', 'php', 'mixed']

export function MiniSearchPreview({data}: { data: SearchPreviewData }) {
  const {typedText, activePill, showCursor} = data

  return (
    <>
      <div className="mini-search-anim">
        <span className="mini-search-text">{typedText}</span>
        <span className={showCursor ? 'mini-search-cursor' : 'mini-search-cursor is-hidden'} aria-hidden="true"/>
      </div>
      <div className="mini-pill-row-anim">
        {PILLS.map((pill) => (
          <span
            key={pill}
            className={
              activePill === pill
                ? 'mini-pill is-active'
                : activePill
                  ? 'mini-pill is-dimmed'
                  : 'mini-pill'
            }
          >
            {pill}
          </span>
        ))}
      </div>
    </>
  )
}
