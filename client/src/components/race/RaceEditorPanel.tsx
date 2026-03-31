import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {playCountdownTick, playGoBeep, playKeystrokeClick} from '../../lib/sounds'
import {useUIStore} from '../../store/uiStore'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const syntaxKeywords = new Set([
  'break',
  'case',
  'catch',
  'const',
  'continue',
  'default',
  'defer',
  'else',
  'export',
  'false',
  'for',
  'func',
  'function',
  'if',
  'import',
  'interface',
  'let',
  'map',
  'new',
  'nil',
  'null',
  'package',
  'range',
  'return',
  'struct',
  'switch',
  'true',
  'type',
  'var',
])

type SyntaxToken =
  'plain'
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'type'
  | 'function'
  | 'operator'
  | 'punctuation'

function buildSyntaxMap(snippet: string) {
  const map: SyntaxToken[] = Array.from({length: snippet.length}, () => 'plain')
  let i = 0

  while (i < snippet.length) {
    const char = snippet[i]
    const next = snippet[i + 1] ?? ''

    if (char === '/' && next === '/') {
      let j = i
      while (j < snippet.length && snippet[j] !== '\n') {
        map[j] = 'comment'
        j += 1
      }
      i = j
      continue
    }

    if (char === '"' || char === '\'' || char === '`') {
      const quote = char
      map[i] = 'string'
      i += 1
      while (i < snippet.length) {
        map[i] = 'string'
        if (snippet[i] === quote && snippet[i - 1] !== '\\') {
          i += 1
          break
        }
        i += 1
      }
      continue
    }

    if (/\d/.test(char)) {
      let j = i
      while (j < snippet.length && /[\d_.]/.test(snippet[j])) {
        map[j] = 'number'
        j += 1
      }
      i = j
      continue
    }

    if (/[A-Za-z_]/.test(char)) {
      let j = i
      while (j < snippet.length && /[A-Za-z0-9_]/.test(snippet[j])) {
        j += 1
      }
      const word = snippet.slice(i, j)
      if (syntaxKeywords.has(word)) {
        for (let k = i; k < j; k += 1) {
          map[k] = 'keyword'
        }
      } else if (/^[A-Z]/.test(word)) {
        for (let k = i; k < j; k += 1) {
          map[k] = 'type'
        }
      } else {
        let nextIndex = j
        while (nextIndex < snippet.length && /\s/.test(snippet[nextIndex])) {
          nextIndex += 1
        }
        if (snippet[nextIndex] === '(') {
          for (let k = i; k < j; k += 1) {
            map[k] = 'function'
          }
        }
      }
      i = j
      continue
    }

    if (/[{}()[\].,;:]/.test(char)) {
      map[i] = 'punctuation'
      i += 1
      continue
    }

    if (/[=+\-*/%!<>|&]/.test(char)) {
      map[i] = 'operator'
      i += 1
      continue
    }

    i += 1
  }

  return map
}

function toLineCol(snippet: string, index: number) {
  const safe = Math.max(0, Math.min(index, snippet.length))
  let line = 1
  let col = 1

  for (let i = 0; i < safe; i += 1) {
    if (snippet[i] === '\n') {
      line += 1
      col = 1
    } else {
      col += 1
    }
  }

  return {line, col}
}

export const RaceEditorPanel = memo(function RaceEditorPanel({
                                                               snippet,
                                                               typed,
                                                               countdown,
                                                               progressPercent,
                                                               phase,
                                                               difficulty,
                                                               avgTime,
                                                               timeRemainingSeconds,
                                                               isLowTime,
                                                               onType,
                                                             }: {
  snippet: string
  typed: string
  countdown: number
  progressPercent: number
  phase: 'queued' | 'countdown' | 'active' | 'finished'
  difficulty?: number
  avgTime?: number
  timeRemainingSeconds: number
  isLowTime: boolean
  onType: (value: string) => void
}) {
  const phraseRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const [focused, setFocused] = useState(true)
  const [cursorPulsing, setCursorPulsing] = useState(true)
  const [inputWidth, setInputWidth] = useState(0)

  const [showGo, setShowGo] = useState(false)
  const prevCountdownRef = useRef(countdown)
  const soundEnabled = useUIStore((state) => state.soundEnabled)

  const isActive = phase === 'active' && snippet.length > 0
  const isCountdown = phase === 'countdown'
  const snippetHidden = !snippet || isCountdown || phase === 'queued'

  // Play countdown tick each second, GO beep when countdown reaches 0
  useEffect(() => {
    const prev = prevCountdownRef.current
    prevCountdownRef.current = countdown

    if (countdown > 0 && countdown < prev && soundEnabled) {
      playCountdownTick()
    }

    if (prev > 0 && countdown === 0 && phase === 'active') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- visual "GO!" flash on race start
      setShowGo(true)
      if (soundEnabled) {
        playGoBeep()
      }
      const timer = window.setTimeout(() => setShowGo(false), 900)
      return () => window.clearTimeout(timer)
    }
  }, [countdown, phase, soundEnabled])
  const cursor = useMemo(() => toLineCol(snippet, typed.length), [snippet, typed.length])

  useEffect(() => {
    if (phraseRef.current) {
      setInputWidth(phraseRef.current.clientWidth)
    }
  }, [snippet])

  function preventCursorPosition() {
    if (!inputRef.current) {
      return
    }
    const length = inputRef.current.value.length
    inputRef.current.setSelectionRange(length, length)
  }

  useEffect(() => {
    if (!isActive) {
      return
    }
    inputRef.current?.focus()
    preventCursorPosition()
  }, [isActive])

  useEffect(() => {
    const next = window.setTimeout(() => setCursorPulsing(true), 1000)
    return () => window.clearTimeout(next)
  }, [typed.length])

  const raceMetrics = useMemo(() => {
    const safeTyped = typed.slice(0, snippet.length)
    let errors = 0
    for (let i = 0; i < safeTyped.length; i += 1) {
      if (safeTyped[i] !== snippet[i]) {
        errors += 1
      }
    }
    const accuracy = safeTyped.length > 0 ? ((safeTyped.length - errors) / safeTyped.length) * 100 : 100
    return {
      errors,
      typedChars: safeTyped.length,
      remainingChars: Math.max(0, snippet.length - safeTyped.length),
      accuracy,
    }
  }, [snippet, typed])

  const hasTypedError = useMemo(() => {
    for (let i = 0; i < typed.length; i += 1) {
      if (typed[i] !== snippet[i]) {
        return true
      }
    }
    return false
  }, [snippet, typed])

  const syntaxMap = useMemo(() => (snippet ? buildSyntaxMap(snippet) : []), [snippet])

  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- deps are intentionally broader than inferred
  const lines = useMemo(() => {
    if (!snippet) {
      return []
    }
    const split = snippet.split('\n')
    let globalIndex = 0

    return split.map((line, lineIndex) => {
      const lineStart = globalIndex
      const lineEnd = lineStart + line.length

      const chars = line.split('').map((char, charIndex) => {
        const idx = lineStart + charIndex
        const actual = typed[idx]
        const syntaxType = syntaxMap[idx] ?? 'plain'
        let className = 'race-type-char race-type-pending'

        if (actual !== undefined) {
          className = actual === char ? 'race-type-char race-type-correct' : 'race-type-char race-type-error'
        }

        if (syntaxType !== 'plain') {
          className += ` race-type-syntax-${syntaxType}`
        }

        if (idx === typed.length) {
          className += ' race-type-current'
        }

        return {
          key: `line-${lineIndex}-char-${charIndex}`,
          value: char === ' ' ? '\u00a0' : char,
          className,
          isCurrent: idx === typed.length,
        }
      })

      globalIndex = lineIndex < split.length - 1 ? lineEnd + 1 : lineEnd

      return {
        key: `line-${lineIndex}`,
        lineNumber: lineIndex + 1,
        chars,
        hasLineBreak: lineIndex < split.length - 1,
      }
    })
  }, [snippet, typed])

  function handleInput(nextValue: string) {
    if (!isActive) {
      return
    }
    if (nextValue.length < typed.length) {
      onType(nextValue)
      return
    }
    if (!nextValue.startsWith(typed)) {
      return
    }
    onType(nextValue.slice(0, snippet.length))
    setCursorPulsing(false)
    if (soundEnabled) {
      playKeystrokeClick()
    }
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    handleInput(event.target.value)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const cursorKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']
    if (cursorKeys.includes(event.key)) {
      event.preventDefault()
      preventCursorPosition()
      return
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      if (!hasTypedError) {
        event.preventDefault()
        return
      }

      // If the last real newline + auto-indent was added as a block,
      // remove the entire indent + newline in one backspace
      const lastNewline = typed.lastIndexOf('\n')
      if (lastNewline !== -1) {
        const afterNewline = typed.slice(lastNewline + 1)
        const isAllIndent = /^[ \t]*$/.test(afterNewline)
        const expectedIndent = snippet.slice(lastNewline + 1, lastNewline + 1 + afterNewline.length)
        if (isAllIndent && afterNewline === expectedIndent) {
          event.preventDefault()
          handleInput(typed.slice(0, lastNewline))
          return
        }
      }
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const nextIndex = typed.length + 1
      let indent = ''

      for (let i = nextIndex; i < snippet.length; i += 1) {
        const char = snippet[i]
        if (char === ' ' || char === '\t') {
          indent += char
          continue
        }
        break
      }

      handleInput(`${typed}\n${indent}`)
    }
  }

  function ignorePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    event.preventDefault()
  }

  return (
    <section className="race-editor-panel typebox-shell">
      <div className="race-panel-head">
        <h2>Type!</h2>
        <p>
          Cursor L{cursor.line}:C{cursor.col}
        </p>
      </div>

      <div className="race-editor-info">
        {difficulty != null && difficulty > 0 ? (
          <span className="race-editor-info-chip" title="Difficulty level">
            {'|'.repeat(difficulty)}{'|'.repeat(Math.max(0, 5 - difficulty)).split('').map((_, i) => <span key={i}
                                                                                                           style={{opacity: 0.25}}>|</span>)}
            {' '}Lvl {difficulty}
          </span>
        ) : null}
        <span className="race-editor-info-chip">{snippet.length} chars</span>
        {avgTime != null && avgTime > 0 ? (
          <span className="race-editor-info-chip">~{avgTime}s avg</span>
        ) : null}
      </div>

      <div className="race-progress-track" aria-hidden="true">
        <div style={{width: `${progressPercent}%`}}/>
      </div>

      <div className="race-editor-metrics" aria-label="Race typing metrics">
        {phase === 'active' ? (
          <span className={isLowTime ? 'race-timer-low' : ''}>{formatTime(timeRemainingSeconds)} left</span>
        ) : null}
        <span>{raceMetrics.typedChars} typed</span>
        <span>{raceMetrics.remainingChars} left</span>
        <span>{raceMetrics.errors} errors</span>
        <span>{raceMetrics.accuracy.toFixed(1)}% acc</span>
      </div>

      <div className="type-box race-type-box">
        {countdown > 0 ? (
          <div className="race-countdown-overlay" aria-live="polite">
            <span>Race starts in</span>
            <strong key={countdown} className="race-countdown-pop">{countdown}</strong>
          </div>
        ) : null}

        {showGo ? (
          <div className="race-go-overlay" aria-live="assertive">
            <strong>GO!</strong>
          </div>
        ) : null}

        {snippetHidden && !countdown && !showGo ? (
          <div className="race-type-phrase race-type-hidden-placeholder">
            <p>Waiting for the race to begin...</p>
          </div>
        ) : null}

        {!snippetHidden ? (
          <div
            className={`race-type-phrase${showGo ? ' race-snippet-reveal' : ''}`}
            style={{
              filter: focused ? 'blur(0)' : 'blur(2px)',
              opacity: focused && isActive ? 1 : 0.62,
            }}
            ref={phraseRef}
          >
            {lines.map((line) => (
              <div key={line.key} className="race-type-line-row">
                <span className="race-type-line-number">{line.lineNumber}</span>
                <span className="race-type-line-code">
                {line.chars.map((char) => (
                  <span
                    key={char.key}
                    className={`${char.className}${char.isCurrent && cursorPulsing && focused && isActive ? ' is-blink' : ''}`}
                  >{char.value}</span>
                ))}
                  {line.hasLineBreak ? <span className="race-line-break-glyph">↵</span> : null}
              </span>
              </div>
            ))}
          </div>
        ) : null}

        {!focused && !snippetHidden ? <div className="race-type-refocus">Click or press any key to focus</div> : null}

        <textarea
          value={typed}
          onPaste={ignorePaste}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="race-type-input"
          ref={inputRef}
          autoCorrect="off"
          autoCapitalize="none"
          autoComplete="off"
          onSelect={preventCursorPosition}
          onMouseDown={preventCursorPosition}
          onMouseUp={preventCursorPosition}
          onClick={preventCursorPosition}
          spellCheck={false}
          style={{
            width: `${inputWidth || 100}%`,
            cursor: !focused ? 'pointer' : 'auto',
            outline: 'none',
          }}
          autoFocus
          onFocus={() => {
            setFocused(true)
            preventCursorPosition()
          }}
          onBlur={() => {
            setFocused(false)
            preventCursorPosition()
          }}
          disabled={!snippet || phase === 'finished' || phase === 'queued' || phase === 'countdown'}
          aria-label="Type race snippet"
        />
      </div>
    </section>
  )
})
