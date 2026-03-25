import type { SecurityPreviewData } from './types'

const EVENTS = ['rate limit active', 'invalid jump blocked', 'suspicious flagged']

export function MiniSecurityPreview({ data }: { data: SecurityPreviewData }) {
  const { visibleCount, isClearing, entryIndex } = data

  return (
    <div className={isClearing ? 'mini-security-wrap is-clearing' : 'mini-security-wrap'}>
      {EVENTS.map((label, i) => {
        if (i >= visibleCount && !isClearing) return null

        const isNew = i === entryIndex && !isClearing
        let cls = 'mini-secure-anim'
        if (isNew) cls += ' is-alerting'
        if (isClearing) cls += ' is-exiting'

        return (
          <div key={label} className={cls}>
            <span className="mini-secure-dot" aria-hidden="true" />
            {label}
          </div>
        )
      })}
    </div>
  )
}
