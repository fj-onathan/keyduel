import type { ReactNode } from 'react'

const featureCardShellClass = 'overflow-hidden rounded-2xl border border-white/10 bg-[#16110d]/75 backdrop-blur-sm'
const featureTitleClass = 'px-4 pt-4 font-sans text-2xl font-semibold tracking-tight text-[#fff0e2]'
const featureBodyClass = 'min-h-24 px-4 pb-5 pt-3 text-sm leading-relaxed text-[#cbb9a7]'

export function FeatureCard({
  title,
  description,
  preview,
}: {
  title: string
  description: string
  preview: ReactNode
}) {
  return (
    <article className={featureCardShellClass}>
      <div className="feature-preview">{preview}</div>
      <h3 className={featureTitleClass}>{title}</h3>
      <p className={featureBodyClass}>{description}</p>
    </article>
  )
}
