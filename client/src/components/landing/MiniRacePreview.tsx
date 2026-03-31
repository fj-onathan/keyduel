import type {RacePreviewData} from './types'

export function MiniRacePreview({raceData, settledWinnerState}: {
  raceData: RacePreviewData;
  settledWinnerState: boolean
}) {
  if (raceData.isCountdown) {
    return (
      <div className="mini-race-countdown" aria-live="polite">
        <span>Game starts in</span>
        <strong className="mini-race-countdown-value">{raceData.countdown}</strong>
      </div>
    )
  }

  return (
    <div key={raceData.round}
         className={settledWinnerState ? 'mini-race mini-race-enter is-finish' : 'mini-race mini-race-enter'}>
      <div className={settledWinnerState ? 'mini-race-lane is-eliminated' : 'mini-race-lane'}>
        <div className="mini-race-meta">
          <span>player-alpha</span>
          <em>
            {raceData.wpm.alpha} WPM <i
            className={raceData.lead === 'alpha' ? 'lane-status lane-status-alpha is-lead' : 'lane-status lane-status-alpha'}>lead</i>
          </em>
        </div>
        <div className="mini-race-track">
          <div className="mini-race-progress mini-race-alpha" style={{width: `${raceData.progress.alpha}%`}}/>
        </div>
      </div>

      <div className={settledWinnerState ? 'mini-race-lane is-eliminated' : 'mini-race-lane'}>
        <div className="mini-race-meta">
          <span>player-beta</span>
          <em>
            {raceData.wpm.beta} WPM <i
            className={raceData.lead === 'beta' ? 'lane-status lane-status-beta is-lead' : 'lane-status lane-status-beta'}>lead</i>
          </em>
        </div>
        <div className="mini-race-track">
          <div className="mini-race-progress mini-race-beta" style={{width: `${raceData.progress.beta}%`}}/>
        </div>
      </div>

      <div className={settledWinnerState ? 'mini-race-lane is-winner' : 'mini-race-lane'}>
        <div className="mini-race-meta">
          <span>player-gamma</span>
          <em>
            {raceData.wpm.gamma} WPM <i
            className={raceData.lead === 'gamma' ? 'lane-status lane-status-gamma is-lead' : 'lane-status lane-status-gamma'}>lead</i>
          </em>
        </div>
        <div className="mini-race-track">
          <div className="mini-race-progress mini-race-gamma" style={{width: `${raceData.progress.gamma}%`}}/>
        </div>
      </div>

      <div className={settledWinnerState ? 'mini-race-winner-banner is-visible' : 'mini-race-winner-banner'}>Winner
      </div>
    </div>
  )
}
