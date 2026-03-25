import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchRandomSnippet, getRandomSnippet, type PracticeSnippet } from '../../lib/practiceSnippets'
import { playFinishSound } from '../../lib/sounds'
import { useUIStore } from '../../store/uiStore'
import { Modal } from '../ui/Modal'
import { RaceEditorPanel } from '../race/RaceEditorPanel'

function formatDuration(ms: number): string {
  if (ms <= 0) return '--'
  const seconds = Math.round(ms / 1000)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export const PracticeModal = memo(function PracticeModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [snippet, setSnippet] = useState<PracticeSnippet>(() => getRandomSnippet())
  const [typed, setTyped] = useState('')
  const [phase, setPhase] = useState<'countdown' | 'active' | 'finished'>('active')
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [finishTime, setFinishTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const soundEnabled = useUIStore((state) => state.soundEnabled)

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Live elapsed time ticker
  useEffect(() => {
    if (phase !== 'active' || !startTime) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTime)
    }, 100)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [phase, startTime])

  const stats = useMemo(() => {
    const code = snippet.code
    const safeTyped = typed.slice(0, code.length)
    let errors = 0
    for (let i = 0; i < safeTyped.length; i++) {
      if (safeTyped[i] !== code[i]) {
        errors++
      }
    }
    const progress = safeTyped.length
    const accuracy = progress > 0 ? ((progress - errors) / progress) * 100 : 100
    const elapsed = finishTime && startTime ? finishTime - startTime : elapsedMs
    const minutes = elapsed / 60000
    const grossWpm = minutes > 0 ? progress / 5 / minutes : 0
    const netWpm = minutes > 0 ? Math.max(0, (progress - errors) / 5 / minutes) : 0
    const completionPercent = code.length > 0 ? Math.min(100, (progress / code.length) * 100) : 0

    return {
      errors,
      progress,
      accuracy,
      grossWpm,
      netWpm,
      elapsed,
      completionPercent,
    }
  }, [typed, snippet.code, startTime, finishTime, elapsedMs])

  const progressPercent = snippet.code.length > 0 ? Math.min(100, (typed.length / snippet.code.length) * 100) : 0

  const handleType = useCallback(
    (nextValue: string) => {
      if (phase === 'finished') return

      // Start timer on first keystroke
      if (!startTime && nextValue.length > 0) {
        setStartTime(Date.now())
      }

      const code = snippet.code
      const sliced = nextValue.slice(0, code.length)
      setTyped(sliced)

      // Check if finished (all characters typed correctly)
      if (sliced.length === code.length && sliced === code) {
        setFinishTime(Date.now())
        setPhase('finished')
        if (soundEnabled) {
          playFinishSound()
        }
      }
    },
    [phase, startTime, snippet.code, soundEnabled],
  )

  const handleNewSnippet = useCallback(() => {
    setLoading(true)
    setTyped('')
    setPhase('active')
    setStartTime(null)
    setFinishTime(null)
    setElapsedMs(0)
    fetchRandomSnippet(snippet).then((next) => {
      setSnippet(next)
      setLoading(false)
    })
  }, [snippet])

  const handleRestart = useCallback(() => {
    setTyped('')
    setPhase('active')
    setStartTime(null)
    setFinishTime(null)
    setElapsedMs(0)
  }, [])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect -- batch reset on open */
      setTyped('')
      setPhase('active')
      setStartTime(null)
      setFinishTime(null)
      setElapsedMs(0)
      setLoading(true)
      /* eslint-enable react-hooks/set-state-in-effect */
      fetchRandomSnippet().then((next) => {
        setSnippet(next)
        setLoading(false)
      })
    }
  }, [open])

  // Override escape when modal is open — we handle close via Modal's onClose
  // but we need to prevent the escape key from propagating to the editor
  const handleClose = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    onClose()
  }, [onClose])

  return (
    <Modal open={open} onClose={handleClose} title="Practice Mode">
      <div className="practice-modal-content">
        <div className="practice-snippet-header">
          <div className="practice-snippet-info">
            <span className="practice-snippet-title">{snippet.title}</span>
            <span className="practice-snippet-lang">{snippet.language}</span>
            <span className="practice-snippet-diff" title="Difficulty level">
              {'|'.repeat(snippet.difficulty)}
              {Array.from({ length: Math.max(0, 5 - snippet.difficulty) }, (_, i) => (
                <span key={i} style={{ opacity: 0.25 }}>|</span>
              ))}
              {' '}Lvl {snippet.difficulty}
            </span>
          </div>
          <div className="practice-actions">
            <button type="button" className="practice-btn practice-btn-secondary" onClick={handleRestart}>
              Restart
            </button>
            <button type="button" className="practice-btn practice-btn-primary" onClick={handleNewSnippet}>
              New Snippet
            </button>
          </div>
        </div>

        <RaceEditorPanel
          snippet={loading ? '' : snippet.code}
          typed={typed}
          countdown={0}
          progressPercent={progressPercent}
          phase={loading ? 'queued' : phase === 'finished' ? 'finished' : 'active'}
          difficulty={snippet.difficulty}
          onType={handleType}
        />

        {phase === 'finished' ? (
          <div className="practice-results">
            <div className="practice-results-banner">Practice Complete</div>
            <div className="practice-results-grid">
              <div>
                <span>Net WPM</span>
                <strong>{stats.netWpm.toFixed(1)}</strong>
              </div>
              <div>
                <span>Gross WPM</span>
                <strong>{stats.grossWpm.toFixed(1)}</strong>
              </div>
              <div>
                <span>Accuracy</span>
                <strong>{stats.accuracy.toFixed(1)}%</strong>
              </div>
              <div>
                <span>Time</span>
                <strong>{formatDuration(stats.elapsed)}</strong>
              </div>
              <div>
                <span>Errors</span>
                <strong>{stats.errors}</strong>
              </div>
              <div>
                <span>Characters</span>
                <strong>{stats.progress}</strong>
              </div>
            </div>
            <div className="practice-results-actions">
              <button type="button" className="practice-btn practice-btn-secondary" onClick={handleRestart}>
                Try Again
              </button>
              <button type="button" className="practice-btn practice-btn-primary" onClick={handleNewSnippet}>
                Next Snippet
              </button>
            </div>
          </div>
        ) : (
          <div className="practice-live-stats">
            <span>{formatDuration(stats.elapsed)} elapsed</span>
            <span>{stats.netWpm.toFixed(0)} WPM</span>
            <span>{stats.accuracy.toFixed(1)}% acc</span>
            <span>{stats.progress}/{snippet.code.length} chars</span>
          </div>
        )}
      </div>
    </Modal>
  )
})
