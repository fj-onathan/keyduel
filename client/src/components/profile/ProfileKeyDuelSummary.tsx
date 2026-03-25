import type { ProfileOverviewResponse } from './types'

type Props = {
  summary: ProfileOverviewResponse['summary']
}

export function ProfileKeyDuelSummary({ summary }: Props) {
  return (
    <article className="profile-panel profile-main-card self-start">
      <h3 className="profile-panel-title text-sm sm:text-base">About KeyDuel</h3>
      <p className="profile-panel-subtitle text-xs sm:text-sm">
        Competitive typing profile metrics across language hubs. Track speed, precision, consistency, and race outcomes.
      </p>

      <div
        className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2"
        aria-label="KeyDuel profile summary stats"
      >
        <p className="m-0 text-xs sm:text-sm text-[#e7d2bc] border border-white/[0.08] rounded-lg bg-[rgba(25,14,11,0.62)] py-1.5 px-2 sm:py-2 sm:px-2.5">
          Best net WPM: {summary.bestNetWpm.toFixed(1)}
        </p>
        <p className="m-0 text-xs sm:text-sm text-[#e7d2bc] border border-white/[0.08] rounded-lg bg-[rgba(25,14,11,0.62)] py-1.5 px-2 sm:py-2 sm:px-2.5">
          Avg accuracy: {summary.avgAccuracy.toFixed(1)}%
        </p>
        <p className="m-0 text-xs sm:text-sm text-[#e7d2bc] border border-white/[0.08] rounded-lg bg-[rgba(25,14,11,0.62)] py-1.5 px-2 sm:py-2 sm:px-2.5">
          Races played: {summary.racesPlayed}
        </p>
        <p className="m-0 text-xs sm:text-sm text-[#e7d2bc] border border-white/[0.08] rounded-lg bg-[rgba(25,14,11,0.62)] py-1.5 px-2 sm:py-2 sm:px-2.5">
          Wins: {summary.wins}
        </p>
        <p className="m-0 text-xs sm:text-sm text-[#e7d2bc] border border-white/[0.08] rounded-lg bg-[rgba(25,14,11,0.62)] py-1.5 px-2 sm:py-2 sm:px-2.5 sm:col-span-2">
          Best streak: {summary.bestStreak} days
        </p>
      </div>
    </article>
  )
}
