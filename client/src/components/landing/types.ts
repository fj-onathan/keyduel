export type LaneKey = 'alpha' | 'beta' | 'gamma'

export type LaneFrame = {
  t: number
  value: number
}

export type RacePreviewData = {
  progress: Record<LaneKey, number>
  lead: LaneKey
  isCountdown: boolean
  isFinish: boolean
  finishElapsedMs: number
  countdown: number
  round: number
  wpm: Record<LaneKey, string>
}

export type StepsPreviewData = {
  activeIndex: number // 0-3 = active step, 4 = all complete, -1 = resetting
}

export type SearchPreviewData = {
  typedText: string
  activePill: string | null // 'go' | 'php' | 'mixed' | null
  showCursor: boolean
}

export type SecurityPreviewData = {
  visibleCount: number // 0-3
  isClearing: boolean
  entryIndex: number // which event just entered (for alerting class)
}

export type FilesPreviewData = {
  files: {
    charCount: number
    isSaved: boolean
    isVisible: boolean
  }[]
  isFading: boolean
}

export type RanksPreviewData = {
  ranks: { value: number; prevValue: number | null; isClimbing: boolean }[]
  isSettled: boolean
  isVisible: boolean
}
