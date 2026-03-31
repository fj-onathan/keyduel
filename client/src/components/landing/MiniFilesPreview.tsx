import type {FilesPreviewData} from './types'

const FILE_NAMES = ['race-2026-03-13.log', 'room-22.snapshot', 'leaderboard.cache']

export function MiniFilesPreview({data}: { data: FilesPreviewData }) {
  const {files, isFading} = data

  return (
    <div className={isFading ? 'mini-files-wrap is-fading' : 'mini-files-wrap'}>
      {files.map((file, i) => {
        if (!file.isVisible) return null

        const displayed = FILE_NAMES[i].slice(0, file.charCount)
        const isTyping = file.charCount < FILE_NAMES[i].length && !file.isSaved

        return (
          <div key={FILE_NAMES[i]} className="mini-file-anim">
            <span className="mini-file-name">
              {displayed}
              {isTyping && <span className="mini-file-cursor" aria-hidden="true"/>}
            </span>
            {file.isSaved && (
              <span className="mini-file-badge">✓ saved</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
