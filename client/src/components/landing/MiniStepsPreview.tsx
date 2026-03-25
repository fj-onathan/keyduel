import type { StepsPreviewData } from './types'

const STEPS = ['Queue', 'Match', 'Countdown', 'Race']

export function MiniStepsPreview({ data }: { data: StepsPreviewData }) {
  const { activeIndex } = data
  const isResetting = activeIndex === -1
  const allComplete = activeIndex === 4

  return (
    <div className={isResetting ? 'mini-steps-wrap is-resetting' : 'mini-steps-wrap'}>
      {STEPS.map((label, i) => {
        const isActive = i === activeIndex
        const isComplete = allComplete || (activeIndex > i && activeIndex >= 0)

        let cls = 'mini-step-anim'
        if (isActive) cls += ' is-active'
        if (isComplete) cls += ' is-complete'

        return (
          <div key={label} className={cls}>
            {isComplete && <span className="mini-step-check" aria-hidden="true">✓</span>}
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
