import { programmingLanguages } from './programmingLanguages'

export type LeaderboardPeriod = 'daily' | 'monthly'
export type LeaderboardHub = string

export type LeaderboardEntry = {
  rank: number
  player: string
  hub: string
  wpm: number
  accuracy: number
  races: number
  delta: number
  isShowcase?: boolean
}

export type HeatmapCell = {
  count: number
  label: string
}

export const showcaseProfile = {
  name: 'sara_nova',
  avatar: '/avatar/s12312abewq.png',
  rankLabel: 'Diamond II',
  primaryHub: 'Go Hub',
  netWpm: '96.2',
  accuracy: '98.4%',
  winRate: '62%',
  streak: '9 days',
  mostActiveHub: 'Go',
  bestDay: 'Thursday',
  monthRaces: '142',
}

export function toHubId(value: string): LeaderboardHub {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'all'
}

const generatedHubs = (() => {
  const seen = new Set<string>()
  const hubs: Array<{ id: LeaderboardHub; label: string }> = []

  for (const label of programmingLanguages) {
    const id = toHubId(label)
    if (id === 'all' || seen.has(id)) {
      continue
    }
    seen.add(id)
    hubs.push({ id, label })
  }

  return hubs
})()

export const availableHubs: Array<{ id: LeaderboardHub; label: string }> = [{ id: 'all', label: 'All languages' }, ...generatedHubs]

const leaderboardByPeriod: Record<LeaderboardPeriod, LeaderboardEntry[]> = {
  daily: [
    { rank: 1, player: 'byte_rider', hub: 'go', wpm: 108.9, accuracy: 98.9, races: 24, delta: 2 },
    { rank: 2, player: 'sara_nova', hub: 'go', wpm: 106.2, accuracy: 98.4, races: 21, delta: 3, isShowcase: true },
    { rank: 3, player: 'lex_loop', hub: 'javascript', wpm: 103.7, accuracy: 97.5, races: 19, delta: -1 },
    { rank: 4, player: 'statik_key', hub: 'php', wpm: 101.2, accuracy: 97.9, races: 17, delta: 1 },
    { rank: 5, player: 'ivy_stack', hub: 'python', wpm: 98.3, accuracy: 98.1, races: 15, delta: 1 },
    { rank: 6, player: 'bento_tabs', hub: 'go', wpm: 96.7, accuracy: 97.1, races: 14, delta: -2 },
    { rank: 7, player: 'echo_semicolon', hub: 'php', wpm: 95.5, accuracy: 96.8, races: 13, delta: 1 },
    { rank: 8, player: 'nova_trace', hub: 'javascript', wpm: 94.1, accuracy: 96.2, races: 12, delta: 0 },
    { rank: 9, player: 'astra_type', hub: 'typescript', wpm: 93.8, accuracy: 97.1, races: 12, delta: 2 },
    { rank: 10, player: 'jvm_surge', hub: 'java', wpm: 92.9, accuracy: 96.6, races: 11, delta: 1 },
    { rank: 11, player: 'oxide_sprint', hub: 'rust', wpm: 91.7, accuracy: 97.3, races: 10, delta: 3 },
    { rank: 12, player: 'sharp_lane', hub: 'csharp', wpm: 90.4, accuracy: 96.1, races: 9, delta: -1 },
    { rank: 13, player: 'kt_momentum', hub: 'kotlin', wpm: 89.6, accuracy: 96.4, races: 9, delta: 1 },
    { rank: 14, player: 'swift_arc', hub: 'swift', wpm: 88.8, accuracy: 96.0, races: 8, delta: 2 },
    { rank: 15, player: 'ruby_rush', hub: 'ruby', wpm: 87.9, accuracy: 95.8, races: 8, delta: 0 },
  ],
  monthly: [
    { rank: 1, player: 'lex_loop', hub: 'javascript', wpm: 102.5, accuracy: 97.7, races: 286, delta: 1 },
    { rank: 2, player: 'byte_rider', hub: 'go', wpm: 101.9, accuracy: 98.2, races: 272, delta: -1 },
    { rank: 3, player: 'sara_nova', hub: 'go', wpm: 99.8, accuracy: 98.4, races: 261, delta: 2, isShowcase: true },
    { rank: 4, player: 'ivy_stack', hub: 'python', wpm: 97.1, accuracy: 97.9, races: 246, delta: 1 },
    { rank: 5, player: 'statik_key', hub: 'php', wpm: 96.2, accuracy: 97.6, races: 233, delta: -1 },
    { rank: 6, player: 'nova_trace', hub: 'javascript', wpm: 94.8, accuracy: 96.9, races: 227, delta: 1 },
    { rank: 7, player: 'bento_tabs', hub: 'go', wpm: 93.6, accuracy: 96.8, races: 216, delta: 0 },
    { rank: 8, player: 'echo_semicolon', hub: 'php', wpm: 92.4, accuracy: 96.5, races: 208, delta: -1 },
    { rank: 9, player: 'astra_type', hub: 'typescript', wpm: 91.7, accuracy: 96.9, races: 204, delta: 2 },
    { rank: 10, player: 'oxide_sprint', hub: 'rust', wpm: 90.8, accuracy: 97.1, races: 198, delta: 1 },
    { rank: 11, player: 'jvm_surge', hub: 'java', wpm: 90.1, accuracy: 96.0, races: 192, delta: -1 },
    { rank: 12, player: 'kt_momentum', hub: 'kotlin', wpm: 89.6, accuracy: 96.2, races: 186, delta: 1 },
    { rank: 13, player: 'sharp_lane', hub: 'csharp', wpm: 88.9, accuracy: 95.8, races: 181, delta: 0 },
    { rank: 14, player: 'swift_arc', hub: 'swift', wpm: 87.5, accuracy: 95.6, races: 175, delta: 2 },
    { rank: 15, player: 'ruby_rush', hub: 'ruby', wpm: 86.8, accuracy: 95.5, races: 170, delta: -1 },
  ],
}

export function getLeaderboardPreview(period: LeaderboardPeriod, hub: LeaderboardHub): LeaderboardEntry[] {
  const rows = leaderboardByPeriod[period]
  if (hub === 'all') {
    return rows.slice(0, 6)
  }

  const filtered = rows.filter((entry) => entry.hub === hub).slice(0, 6)
  if (filtered.length > 0) {
    return filtered
  }

  // Fallback preview for hubs without seeded top rows yet.
  return rows.slice(0, 6).map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    hub,
    isShowcase: idx === 2,
  }))
}

export function getShowcaseHeatmap(): HeatmapCell[][] {
  const totalDays = 52 * 7
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - (totalDays - 1))

  let carry = 0

  const cells = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)

    const day = date.getDay()
    const month = date.getMonth()
    const year = date.getFullYear()
    const monthDay = date.getDate()

    const hashSeed = year * 10000 + (month + 1) * 100 + monthDay
    const noise = Math.abs(Math.sin(hashSeed * 12.9898 + day * 78.233 + i * 0.137))
    const seasonalBoost = Math.sin((i / totalDays) * Math.PI * 2) * 0.7
    const weekendBoost = day === 0 || day === 6 ? 0.55 : 0

    const raw = noise * 4.8 + seasonalBoost + weekendBoost + carry
    let count = Math.max(0, Math.min(7, Math.floor(raw)))

    // Keep some natural empty gaps and streak-like rhythm.
    if (noise < 0.19 && day !== 6) {
      count = 0
    }

    carry = count > 0 ? 0.18 : -0.05

    const labelDate = date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    return {
      count,
      label: `${labelDate}: ${count} races`,
    }
  })

  const weeks: HeatmapCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return weeks
}
