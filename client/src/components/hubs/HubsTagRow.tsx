export type HubsLanguageTag = {
  value: string
  label: string
  online: number
  hot: boolean
}

type HubsTagRowProps = {
  tags: HubsLanguageTag[]
  selected: string
  onSelect: (value: string) => void
  disabled?: boolean
}

export function HubsTagRow({tags, selected, onSelect, disabled = false}: HubsTagRowProps) {
  return (
    <div className="hubs-tag-row" aria-label="Most played languages">
      <button
        type="button"
        className={`hubs-tag ${selected === 'all' ? 'is-selected' : ''}`.trim()}
        onClick={() => onSelect('all')}
        disabled={disabled}
      >
        All
      </button>

      {tags.map((tag) => (
        <button
          key={tag.value}
          type="button"
          className={`hubs-tag ${selected === tag.value ? 'is-selected' : ''}`.trim()}
          onClick={() => onSelect(tag.value)}
          disabled={disabled}
        >
          {tag.label}
          {tag.hot ? <i className="hubs-tag-hot" aria-hidden="true"/> : null}
          <span>{tag.online}</span>
        </button>
      ))}
    </div>
  )
}
