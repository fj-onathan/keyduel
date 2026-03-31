import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {Button} from '../components/ui/Button'
import {apiGet} from '../lib/api'

type LeaderboardEntry = {
  userId: string
  username: string
  avatarUrl?: string
  displayName?: string
  rank?: number
  rankDelta?: number
  metricType: 'speed' | 'accuracy' | 'wins'
  metricValue: number
  wins: number
  racesPlayed: number
  bestNetWpm: number
  avgAccuracy: number
}

type LeaderboardResponse = {
  metric: 'speed' | 'accuracy' | 'wins'
  range?: 'weekly' | 'all-time'
  items: LeaderboardEntry[]
  community?: {
    mostPlayedHub?: {
      slug: string
      title: string
      races: number
      sharePercent: number
    }
    mostActiveWindow?: {
      label: string
      races: number
    }
    avgWpmByTier?: {
      gold: number
      silver: number
      bronze: number
    }
    topImprover?: {
      username: string
      delta: number
    }
    participation?: {
      rankedPlayers: number
      totalRaces: number
      newEntrants7d: number
    }
    racesTrend?: Array<{
      bucket: string
      races: number
    }>
    hubUsageTop10?: Array<{
      slug: string
      title: string
      races: number
      sharePercent: number
    }>
  }
}

type HubItem = {
  id: string
  slug: string
  title: string
  activePlayers: number
  racesToday: number
}

type HubsResponse = {
  items: HubItem[]
}

type SocialRivalsResponse = {
  items: LeaderboardEntry[]
}

type Timeframe = 'weekly' | 'all-time'
type Trend = 'up' | 'down' | 'flat'

type RankedEntry = LeaderboardEntry & {
  rank: number
  delta: number
  trend: Trend
}

type RewardTier = {
  id: string
  label: string
  threshold: number
  reward: string
  icon: string
}

const TARGET_RANKS = [10, 25, 50, 100]
const PREFERRED_USERNAME = 'client-1'
const LEADERBOARD_PAGE_SIZE = 15
const REWARD_TIERS: RewardTier[] = [
  {id: 'top10', label: 'Top 10', threshold: 10, reward: 'Champion crest + animated frame', icon: 'CR'},
  {id: 'top25', label: 'Top 25', threshold: 25, reward: 'Elite banner + profile glow', icon: 'BN'},
  {id: 'top50', label: 'Top 50', threshold: 50, reward: 'Contender banner for next season', icon: 'CT'},
  {id: 'top100', label: 'Top 100', threshold: 100, reward: 'Seasonal mark + streak boost', icon: 'MK'},
]

function seededDelta(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33 + seed.charCodeAt(i)) | 0
  }
  return (Math.abs(hash) % 11) - 4
}

function formatMetric(metric: 'speed' | 'accuracy' | 'wins', value: number): string {
  if (metric === 'wins') {
    return `${Math.round(value)} wins`
  }
  if (metric === 'accuracy') {
    return `${value.toFixed(2)}%`
  }
  return `${value.toFixed(1)} WPM`
}

function metricUnit(metric: 'speed' | 'accuracy' | 'wins'): string {
  if (metric === 'wins') {
    return 'wins'
  }
  if (metric === 'accuracy') {
    return '%'
  }
  return 'WPM'
}

function podiumBadge(rank: number): string {
  if (rank === 1) {
    return 'Crown'
  }
  if (rank === 2) {
    return 'Challenger'
  }
  return 'Contender'
}

function trendIcon(trend: Trend): string {
  if (trend === 'up') {
    return '▲'
  }
  if (trend === 'down') {
    return '▼'
  }
  return '•'
}

function isFriendCandidate(username: string): boolean {
  let hash = 0
  for (let i = 0; i < username.length; i += 1) {
    hash = (hash * 37 + username.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 3 === 0
}

function seasonCountdown(): string {
  const now = new Date()
  const seasonEnd = new Date(now)
  seasonEnd.setUTCDate(now.getUTCDate() + ((7 - now.getUTCDay()) % 7 || 7))
  seasonEnd.setUTCHours(0, 0, 0, 0)
  const ms = Math.max(0, seasonEnd.getTime() - now.getTime())
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return `${days}d ${hours}h remaining`
}

function mockMetricValue(metric: 'speed' | 'accuracy' | 'wins', rank: number): number {
  if (metric === 'wins') {
    return Math.max(1, 160 - rank * 2)
  }
  if (metric === 'accuracy') {
    return Math.max(88, 99.7 - rank * 0.1)
  }
  return Math.max(48, 135 - rank * 1.2)
}

function buildMockPayload(metric: 'speed' | 'accuracy' | 'wins', timeframe: Timeframe): {
  leaderboard: LeaderboardResponse
  hubs: HubsResponse
  rivals: SocialRivalsResponse
} {
  const names = [
    'move_anna', 'move_ben', 'move_cara', 'typed_fox', 'jet_keystrokes', 'nexa_wpm', 'arc_runner', 'pulse_typist',
    'cinder_fast', 'byte_flame', 'queue_breaker', 'node_dash', 'sprint_rider', 'omega_lines', 'syntax_ace', 'rapid_loop',
    'glide_input', 'zen_keys', 'focus_hunt', 'cartridge', 'quick_mantis', 'updraft', 'proto_shot', 'delta_lane',
  ]

  const items: LeaderboardEntry[] = Array.from({length: 60}, (_, index) => {
    const rank = index + 1
    const username = names[index % names.length] + (index >= names.length ? `_${Math.floor(index / names.length)}` : '')
    const rankDelta = ((index * 7) % 9) - 3
    return {
      userId: `mock-user-${rank}`,
      username,
      rank,
      rankDelta,
      metricType: metric,
      metricValue: mockMetricValue(metric, rank),
      wins: Math.max(0, 130 - rank),
      racesPlayed: Math.max(6, 220 - rank * 2),
      bestNetWpm: Math.max(45, 132 - rank * 1.18),
      avgAccuracy: Math.max(88, 99.5 - rank * 0.09),
    }
  })

  const hubs: HubsResponse = {
    items: [
      {id: 'go', slug: 'go', title: 'Go Hub', activePlayers: 118, racesToday: 412},
      {id: 'ts', slug: 'typescript', title: 'TypeScript Hub', activePlayers: 95, racesToday: 336},
      {id: 'py', slug: 'python', title: 'Python Hub', activePlayers: 88, racesToday: 298},
      {id: 'rs', slug: 'rust', title: 'Rust Hub', activePlayers: 61, racesToday: 207},
      {id: 'java', slug: 'java', title: 'Java Hub', activePlayers: 47, racesToday: 164},
      {id: 'cpp', slug: 'cpp', title: 'C++ Hub', activePlayers: 39, racesToday: 128},
      {id: 'swift', slug: 'swift', title: 'Swift Hub', activePlayers: 31, racesToday: 106},
      {id: 'php', slug: 'php', title: 'PHP Hub', activePlayers: 24, racesToday: 84},
      {id: 'kotlin', slug: 'kotlin', title: 'Kotlin Hub', activePlayers: 18, racesToday: 68},
      {id: 'ruby', slug: 'ruby', title: 'Ruby Hub', activePlayers: 14, racesToday: 52},
    ],
  }

  const totalRaces = hubs.items.reduce((sum, hub) => sum + hub.racesToday, 0)
  const racesTrend = (timeframe === 'weekly'
    ? ['2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14', '2026-03-15', '2026-03-16', '2026-03-17']
    : ['2026-W02', '2026-W03', '2026-W04', '2026-W05', '2026-W06', '2026-W07', '2026-W08'])
    .map((bucket, idx) => ({bucket, races: 95 + idx * 16 + ((idx % 2) * 9)}))

  const community: NonNullable<LeaderboardResponse['community']> = {
    mostPlayedHub: {
      slug: hubs.items[0].slug,
      title: hubs.items[0].title,
      races: hubs.items[0].racesToday,
      sharePercent: Math.round((hubs.items[0].racesToday / totalRaces) * 100),
    },
    mostActiveWindow: {
      label: '20:00-24:00 UTC',
      races: 194,
    },
    avgWpmByTier: {
      gold: 118.4,
      silver: 97.2,
      bronze: 78.9,
    },
    topImprover: {
      username: 'move_anna',
      delta: 7,
    },
    participation: {
      rankedPlayers: items.length,
      totalRaces,
      newEntrants7d: 26,
    },
    racesTrend,
    hubUsageTop10: hubs.items.map((hub) => ({
      slug: hub.slug,
      title: hub.title,
      races: hub.racesToday,
      sharePercent: Math.round((hub.racesToday / totalRaces) * 100),
    })),
  }

  return {
    leaderboard: {
      metric,
      range: timeframe,
      items,
      community,
    },
    hubs,
    rivals: {
      items: items.slice(8, 13),
    },
  }
}

function chartPath(points: number[], width: number, height: number): string {
  if (points.length === 0) {
    return ''
  }
  const max = Math.max(...points, 1)
  const min = 0
  const range = Math.max(1, max - min)
  return points
    .map((value, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

function chartPointCoords(values: number[], width: number, height: number): Array<{ x: number; y: number }> {
  if (values.length === 0) {
    return []
  }
  const max = Math.max(...values, 1)
  const range = Math.max(1, max)
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width
    const y = height - (value / range) * height
    return {x, y}
  })
}

function formatBucketLabel(bucket: string): string {
  if (bucket.includes('-W')) {
    const parts = bucket.split('-W')
    if (parts.length === 2) {
      return `W${parts[1]}`
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(bucket)) {
    return bucket.slice(5)
  }
  return bucket
}

function compactHubLabel(title: string): string {
  if (title.length <= 16) {
    return title
  }
  return `${title.slice(0, 16)}...`
}

function rankToTier(rank: number | null | undefined): 'Gold' | 'Silver' | 'Bronze' {
  if (!rank || rank <= 10) {
    return 'Gold'
  }
  if (rank <= 30) {
    return 'Silver'
  }
  return 'Bronze'
}

function tierDeltaLabel(tier: 'Gold' | 'Silver' | 'Bronze', timeframe: Timeframe): string {
  const seed = timeframe === 'weekly' ? 1.8 : 0.9
  const value = tier === 'Gold' ? seed + 0.7 : tier === 'Silver' ? seed + 0.2 : seed - 0.3
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)} vs prev`
}

export function LeaderboardPage() {
  const {hubSlug} = useParams<{ hubSlug?: string }>()
  const navigate = useNavigate()
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly')
  const [metric, setMetric] = useState<'speed' | 'accuracy' | 'wins'>('speed')
  const [items, setItems] = useState<LeaderboardEntry[]>([])
  const [hubs, setHubs] = useState<HubItem[]>([])
  const [community, setCommunity] = useState<LeaderboardResponse['community'] | null>(null)
  const [lastUpdated, setLastUpdated] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadTick, setReloadTick] = useState(0)
  const [tablePage, setTablePage] = useState(1)
  const currentRowRef = useRef<HTMLElement | null>(null)
  const [rivalsItems, setRivalsItems] = useState<LeaderboardEntry[]>([])
  const [hubSearch, setHubSearch] = useState('')
  const [hubSearchOpen, setHubSearchOpen] = useState(false)
  const hubSearchRef = useRef<HTMLDivElement | null>(null)
  const hubSearchInputRef = useRef<HTMLInputElement | null>(null)

  const selectedHub = hubSlug ?? 'all'

  const activeHubTitle = useMemo(() => {
    if (selectedHub === 'all') return null
    const match = hubs.find((h) => h.slug === selectedHub)
    return match?.title ?? selectedHub
  }, [selectedHub, hubs])

  const filteredHubs = useMemo(() => {
    if (!hubSearch.trim()) return hubs.slice(0, 20)
    const q = hubSearch.trim().toLowerCase()
    return hubs
      .filter((h) => h.title.toLowerCase().includes(q) || h.slug.toLowerCase().includes(q))
      .slice(0, 20)
  }, [hubSearch, hubs])

  const handleHubSelect = useCallback((slug: string) => {
    setHubSearch('')
    setHubSearchOpen(false)
    if (slug === 'all') {
      navigate('/leaderboard')
    } else {
      navigate(`/leaderboard/${slug}`)
    }
  }, [navigate])

  // Close search dropdown on outside click
  useEffect(() => {
    if (!hubSearchOpen) return

    function onClickOutside(e: MouseEvent) {
      if (hubSearchRef.current && !hubSearchRef.current.contains(e.target as Node)) {
        setHubSearchOpen(false)
        setHubSearch('')
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [hubSearchOpen])

  // Fetch hubs once on mount — hub data does not depend on metric or timeframe.
  useEffect(() => {
    const useMock = new URLSearchParams(window.location.search).get('mock') === '1'
    if (useMock) {
      return
    }

    const controller = new AbortController()
    apiGet<HubsResponse>('/hubs?limit=200&offset=0&activeOnly=true', {signal: controller.signal})
      .then((hubsPayload) => {
        if (!controller.signal.aborted) {
          setHubs(hubsPayload.items)
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        // Hubs are non-critical; failing silently is acceptable.
      })

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const useMock = new URLSearchParams(window.location.search).get('mock') === '1'
    if (useMock) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state before async mock
      setLoading(true)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('')
      const timer = window.setTimeout(() => {
        const payload = buildMockPayload(metric, timeframe)
        setItems(payload.leaderboard.items)
        setCommunity(payload.leaderboard.community ?? null)
        setHubs(payload.hubs.items)
        setRivalsItems(payload.rivals.items)
        setLastUpdated('demo mode')
        setLoading(false)
      }, 240)
      return () => {
        window.clearTimeout(timer)
      }
    }

    const controller = new AbortController()
    const startedAt = Date.now()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state before async fetch
    setLoading(true)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError('')

    const hubParam = selectedHub !== 'all' ? `/${selectedHub}` : ''

    void Promise.all([
      apiGet<LeaderboardResponse>(`/leaderboard${hubParam}?metric=${metric}&range=${timeframe}&limit=100&offset=0`, {signal: controller.signal}),
      apiGet<SocialRivalsResponse>(`/social/rivals?metric=${metric}&range=${timeframe}&limit=5`, {signal: controller.signal}),
    ])
      .then(([leaderboardPayload, rivalsPayload]) => {
        if (controller.signal.aborted) {
          return
        }
        setItems(leaderboardPayload.items)
        setCommunity(leaderboardPayload.community ?? null)
        setRivalsItems(rivalsPayload.items)
        const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
        setLastUpdated(`${seconds}s ago`)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [metric, reloadTick, selectedHub, timeframe])

  const tableRows = useMemo<RankedEntry[]>(() => {
    return items.map((entry, index) => {
      const delta = typeof entry.rankDelta === 'number' ? entry.rankDelta : seededDelta(`${entry.username}-${metric}-${timeframe}`)
      const rank = typeof entry.rank === 'number' && entry.rank > 0 ? entry.rank : index + 1
      return {
        ...entry,
        rank,
        delta,
        trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
      }
    })
  }, [items, metric, timeframe])

  const podiumRows = tableRows.slice(0, 3)

  const currentUser = useMemo(() => {
    const exact = tableRows.find((entry) => entry.username.toLowerCase() === PREFERRED_USERNAME)
    if (exact) {
      return exact
    }
    if (tableRows.length > 12) {
      return tableRows[12]
    }
    return tableRows[0] ?? null
  }, [tableRows])

  const targetRank = useMemo(() => {
    if (!currentUser) {
      return null
    }
    return TARGET_RANKS.find((rank) => rank < currentUser.rank) ?? null
  }, [currentUser])

  const targetRow = useMemo(() => {
    if (!targetRank) {
      return null
    }
    return tableRows[targetRank - 1] ?? null
  }, [targetRank, tableRows])

  const pointsToTarget = useMemo(() => {
    if (!targetRow || !currentUser) {
      return 0
    }
    return Math.max(0, targetRow.metricValue - currentUser.metricValue)
  }, [targetRow, currentUser])

  const movementFeed = useMemo(() => {
    return tableRows
      .slice()
      .sort((a, b) => b.delta - a.delta || a.rank - b.rank)
      .slice(0, 6)
      .filter((entry) => entry.delta !== 0)
      .map((entry) => ({
        id: entry.userId,
        username: entry.username,
        rank: entry.rank,
        delta: entry.delta,
        trend: entry.trend,
      }))
  }, [tableRows])

  useEffect(() => {
    if (loading || error || !currentUser) {
      return
    }
    const timer = window.setTimeout(() => {
      currentRowRef.current?.scrollIntoView({block: 'nearest', behavior: 'smooth'})
    }, 180)
    return () => {
      window.clearTimeout(timer)
    }
  }, [currentUser, error, loading])

  const stats = useMemo(() => {
    const mostPlayedHubFallback = hubs.slice().sort((a, b) => b.racesToday - a.racesToday)[0] ?? null
    const totalRaces = hubs.reduce((sum, hub) => sum + hub.racesToday, 0)
    const totalOnline = hubs.reduce((sum, hub) => sum + hub.activePlayers, 0)
    const topImproverFallback = tableRows.slice().sort((a, b) => b.delta - a.delta || a.rank - b.rank)[0] ?? null

    const mostPlayedHub = community?.mostPlayedHub?.title
      ? {
        title: community.mostPlayedHub.title,
        racesToday: community.mostPlayedHub.races,
      }
      : mostPlayedHubFallback

    const topImprover = community?.topImprover?.username
      ? {
        username: community.topImprover.username,
        delta: community.topImprover.delta,
      }
      : topImproverFallback

    const activeWindow = community?.mostActiveWindow?.label ?? '18:00-22:00 UTC'
    const avgWpmByTier = community?.avgWpmByTier ?? null
    const rankedPlayers = community?.participation?.rankedPlayers ?? tableRows.length
    const racesInScope = community?.participation?.totalRaces ?? totalRaces
    const newEntrants = community?.participation?.newEntrants7d ?? 0
    const mostPlayedShare = community?.mostPlayedHub?.sharePercent ?? 0
    const racesTrend = community?.racesTrend ?? []
    const hubUsageTop10 = community?.hubUsageTop10 ?? []

    return {
      mostPlayedHub,
      totalRaces: racesInScope,
      totalOnline,
      topImprover,
      activeWindow,
      avgWpmByTier,
      rankedPlayers,
      newEntrants,
      mostPlayedShare,
      racesTrend,
      hubUsageTop10,
    }
  }, [community, hubs, tableRows])

  const trendValues = useMemo(() => stats.racesTrend.map((point) => point.races), [stats.racesTrend])
  const trendD = useMemo(() => chartPath(trendValues, 680, 180), [trendValues])
  const trendPoints = useMemo(() => chartPointCoords(trendValues, 680, 180), [trendValues])
  const maxHubRaces = useMemo(() => Math.max(...stats.hubUsageTop10.map((hub) => hub.races), 1), [stats.hubUsageTop10])
  const trendMax = useMemo(() => Math.max(...trendValues, 1), [trendValues])
  const trendMid = useMemo(() => Math.round(trendMax / 2), [trendMax])
  const trendTickLabels = useMemo(() => {
    if (stats.racesTrend.length === 0) {
      return [] as Array<{ id: string; label: string }>
    }
    const indices = Array.from(new Set([0, Math.floor((stats.racesTrend.length - 1) / 2), stats.racesTrend.length - 1]))
    return indices.map((index) => ({
      id: `${index}-${stats.racesTrend[index].bucket}`,
      label: formatBucketLabel(stats.racesTrend[index].bucket),
    }))
  }, [stats.racesTrend])
  const tierRows = useMemo(
    () => [
      {key: 'Gold', value: stats.avgWpmByTier?.gold ?? 0},
      {key: 'Silver', value: stats.avgWpmByTier?.silver ?? 0},
      {key: 'Bronze', value: stats.avgWpmByTier?.bronze ?? 0},
    ],
    [stats.avgWpmByTier],
  )
  const tierMax = useMemo(() => Math.max(...tierRows.map((tier) => tier.value), 1), [tierRows])
  const currentTier = useMemo(() => rankToTier(currentUser?.rank), [currentUser?.rank])

  const friendsRows = useMemo(() => {
    const source = rivalsItems.length > 0 ? rivalsItems : tableRows.filter((entry) => isFriendCandidate(entry.username))
    const candidates = source.map((entry, index) => {
      const delta = typeof entry.rankDelta === 'number' ? entry.rankDelta : seededDelta(`${entry.username}-${metric}-${timeframe}-rival`)
      const rank = typeof entry.rank === 'number' && entry.rank > 0 ? entry.rank : index + 1
      return {
        ...entry,
        rank,
        delta,
        trend: delta > 0 ? 'up' as const : delta < 0 ? 'down' as const : 'flat' as const,
      }
    })
    const aroundUser = currentUser
      ? candidates
        .slice()
        .sort((a, b) => Math.abs(a.rank - currentUser.rank) - Math.abs(b.rank - currentUser.rank))
      : candidates

    const selected = aroundUser.slice(0, 5)
    if (currentUser && selected.every((entry) => entry.userId !== currentUser.userId)) {
      return [currentUser, ...selected.slice(0, 4)]
    }
    return selected
  }, [currentUser, metric, rivalsItems, tableRows, timeframe])

  const rivalryHeadline = useMemo(() => {
    if (!currentUser || friendsRows.length === 0) {
      return 'No rivalry matches yet.'
    }
    const aheadFriend = friendsRows
      .filter((entry) => entry.rank < currentUser.rank)
      .sort((a, b) => b.rank - a.rank)[0]
    if (!aheadFriend) {
      return 'You lead your circle. Hold the line.'
    }
    const gap = Math.max(0, aheadFriend.metricValue - currentUser.metricValue)
    return `${gap.toFixed(metric === 'wins' ? 0 : 1)} ${metricUnit(metric)} behind @${aheadFriend.username}`
  }, [currentUser, friendsRows, metric])

  const rewardRows = useMemo(() => {
    const rank = currentUser?.rank ?? Number.POSITIVE_INFINITY
    const nextTarget = REWARD_TIERS.find((tier) => rank > tier.threshold)?.id ?? null

    return REWARD_TIERS.map((tier) => {
      const unlocked = rank <= tier.threshold
      const state = unlocked ? 'unlocked' : nextTarget === tier.id ? 'next' : 'locked'
      const needed = unlocked || !Number.isFinite(rank) ? 0 : Math.max(0, rank - tier.threshold)
      return {
        ...tier,
        state,
        needed,
      }
    })
  }, [currentUser])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset page on filter change
    setTablePage(1)
  }, [metric, selectedHub, timeframe])

  const totalTablePages = useMemo(() => Math.max(1, Math.ceil(tableRows.length / LEADERBOARD_PAGE_SIZE)), [tableRows.length])

  useEffect(() => {
    if (tablePage > totalTablePages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clamp to valid range
      setTablePage(totalTablePages)
    }
  }, [tablePage, totalTablePages])

  const pagedTableRows = useMemo(() => {
    const start = (tablePage - 1) * LEADERBOARD_PAGE_SIZE
    return tableRows.slice(start, start + LEADERBOARD_PAGE_SIZE)
  }, [tablePage, tableRows])

  const tablePageNumbers = useMemo(() => {
    const windowSize = 5
    let start = Math.max(1, tablePage - Math.floor(windowSize / 2))
    const end = Math.min(totalTablePages, start + windowSize - 1)
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1)
    }
    return Array.from({length: end - start + 1}, (_, index) => start + index)
  }, [tablePage, totalTablePages])

  return (
    <main className="layout mx-auto max-w-7xl px-6 leaderboard-page">
      <section className="leaderboard-arena">
        <header className="leaderboard-stage-head">
          <div>
            <p className="leaderboard-stage-kicker">{activeHubTitle ? `${activeHubTitle}` : 'Global Arena'}</p>
            <h1>Leaderboard Season Alpha</h1>
          </div>
          <div className="leaderboard-stage-meta">
            <span>{seasonCountdown()}</span>
            <span>Updated {lastUpdated || 'just now'}</span>
          </div>
        </header>

        <div className="leaderboard-stage-controls" role="tablist" aria-label="Leaderboard filters">
          <div className="leaderboard-stage-controls-left">
            <Button className={timeframe === 'weekly' ? 'leaderboard-stage-pill is-active' : 'leaderboard-stage-pill'}
                    onClick={() => {
                      if (timeframe !== 'weekly') setTimeframe('weekly')
                    }}>
              Weekly Race
            </Button>
            <Button className={timeframe === 'all-time' ? 'leaderboard-stage-pill is-active' : 'leaderboard-stage-pill'}
                    onClick={() => {
                      if (timeframe !== 'all-time') setTimeframe('all-time')
                    }}>
              All-Time Ladder
            </Button>
            <Button className={metric === 'speed' ? 'leaderboard-stage-pill is-active' : 'leaderboard-stage-pill'}
                    onClick={() => {
                      if (metric !== 'speed') setMetric('speed')
                    }}>
              Speed
            </Button>
            <Button className={metric === 'accuracy' ? 'leaderboard-stage-pill is-active' : 'leaderboard-stage-pill'}
                    onClick={() => {
                      if (metric !== 'accuracy') setMetric('accuracy')
                    }}>
              Accuracy
            </Button>
            <Button className={metric === 'wins' ? 'leaderboard-stage-pill is-active' : 'leaderboard-stage-pill'}
                    onClick={() => {
                      if (metric !== 'wins') setMetric('wins')
                    }}>
              Wins
            </Button>
          </div>
          <div className="leaderboard-hub-filter" ref={hubSearchRef}>
            <button
              type="button"
              className={`leaderboard-hub-filter-btn ${hubSearchOpen ? 'is-open' : ''} ${selectedHub !== 'all' ? 'is-filtered' : ''}`}
              onClick={() => {
                setHubSearchOpen((v) => !v)
                setTimeout(() => hubSearchInputRef.current?.focus(), 0)
              }}
            >
              <span className="leaderboard-hub-filter-label">Language</span>
              <span className="leaderboard-hub-filter-value">{activeHubTitle ?? 'All'}</span>
              <span className="leaderboard-hub-filter-caret"
                    aria-hidden="true">{hubSearchOpen ? '\u25B2' : '\u25BC'}</span>
            </button>
            {hubSearchOpen ? (
              <div className="leaderboard-hub-popover">
                <input
                  ref={hubSearchInputRef}
                  type="text"
                  className="leaderboard-hub-popover-input"
                  placeholder="Search languages..."
                  value={hubSearch}
                  onChange={(e) => setHubSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setHubSearchOpen(false)
                      setHubSearch('')
                    }
                    if (e.key === 'Enter' && filteredHubs.length > 0) {
                      handleHubSelect(filteredHubs[0].slug)
                    }
                  }}
                />
                <ul className="leaderboard-hub-popover-list">
                  {!hubSearch.trim() ? (
                    <li>
                      <button
                        type="button"
                        className={selectedHub === 'all' ? 'is-active' : ''}
                        onClick={() => handleHubSelect('all')}
                      >
                        All Languages
                      </button>
                    </li>
                  ) : null}
                  {filteredHubs.length > 0 ? (
                    filteredHubs.map((hub) => (
                      <li key={hub.id}>
                        <button
                          type="button"
                          className={selectedHub === hub.slug ? 'is-active' : ''}
                          onClick={() => handleHubSelect(hub.slug)}
                        >
                          {hub.title}
                        </button>
                      </li>
                    ))
                  ) : hubSearch.trim() ? (
                    <li className="leaderboard-hub-popover-empty">No languages found</li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {!loading && !error && currentUser ? (
          <section className="leaderboard-mobile-rank" aria-label="Mobile rank snapshot">
            <strong>#{currentUser.rank}</strong>
            <span>{currentUser.username}</span>
            <em className={currentUser.trend === 'up' ? 'is-up' : currentUser.trend === 'down' ? 'is-down' : 'is-flat'}>
              {currentUser.delta > 0 ? `+${currentUser.delta}` : currentUser.delta}
            </em>
          </section>
        ) : null}

        {loading ? (
          <section className="leaderboard-stage-skeleton" aria-label="Loading leaderboard">
            <div className="leaderboard-skeleton-block leaderboard-skeleton-header"/>
            <div className="leaderboard-skeleton-grid">
              <div className="leaderboard-skeleton-block leaderboard-skeleton-podium"/>
              <div className="leaderboard-skeleton-block leaderboard-skeleton-card"/>
            </div>
            <div className="leaderboard-skeleton-block leaderboard-skeleton-rail"/>
            <div className="leaderboard-skeleton-block leaderboard-skeleton-table"/>
          </section>
        ) : null}
        {error ? (
          <div className="leaderboard-feedback" role="alert">
            <p>{error}</p>
            <Button onClick={() => setReloadTick((value) => value + 1)}>Retry</Button>
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <section className="leaderboard-empty" aria-label="No leaderboard data">
            <h2>No races yet{activeHubTitle ? ` in ${activeHubTitle}` : ''}</h2>
            <p>
              {selectedHub !== 'all'
                ? 'Be the first to race in this hub and claim the top spot!'
                : 'No leaderboard data is available yet. Play some races to get started!'}
            </p>
            {selectedHub !== 'all' ? (
              <div className="leaderboard-empty-actions">
                <Link to={`/race/${selectedHub}`} className="leaderboard-empty-race-btn">
                  Race in {activeHubTitle ?? selectedHub}
                </Link>
                <Link to="/leaderboard" className="leaderboard-empty-global-btn">
                  View Global Leaderboard
                </Link>
              </div>
            ) : null}
          </section>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <>
            <section className="leaderboard-stage-grid">
              <div className="leaderboard-podium-large" aria-label="Top podium">
                {podiumRows.map((entry) => (
                  <article key={entry.userId} className={`leaderboard-podium-large-card rank-${entry.rank}`}>
                    <p>#{entry.rank}</p>
                    {entry.avatarUrl ? (
                      <img src={entry.avatarUrl} alt={entry.username} className="leaderboard-podium-avatar"/>
                    ) : (
                      <span
                        className="leaderboard-podium-avatar-placeholder">{entry.username.charAt(0).toUpperCase()}</span>
                    )}
                    <h2>@{entry.username}</h2>
                    {entry.displayName ?
                      <span className="leaderboard-podium-realname">{entry.displayName}</span> : null}
                    <em>{podiumBadge(entry.rank)}</em>
                    <strong>{formatMetric(metric, entry.metricValue)}</strong>
                    <span>{entry.bestNetWpm.toFixed(1)} WPM | {entry.avgAccuracy.toFixed(1)}% acc</span>
                  </article>
                ))}
              </div>

              {currentUser ? (
                <aside className="leaderboard-challenge-card" aria-label="Your challenge">
                  <p className="leaderboard-challenge-kicker">Your challenge</p>
                  <h2>#{currentUser.rank} right now</h2>
                  <div className="leaderboard-challenge-stats">
                    <span
                      className={currentUser.trend === 'up' ? 'is-up' : currentUser.trend === 'down' ? 'is-down' : 'is-flat'}>
                      {trendIcon(currentUser.trend)} {currentUser.delta > 0 ? `+${currentUser.delta}` : currentUser.delta} today
                    </span>
                    <span>{formatMetric(metric, currentUser.metricValue)}</span>
                  </div>
                  <p>
                    {targetRank ? `${pointsToTarget.toFixed(metric === 'wins' ? 0 : 1)} ${metricUnit(metric)} to break into Top ${targetRank}` : 'You are in the top bracket. Defend your place.'}
                  </p>
                </aside>
              ) : null}
            </section>

            <section className="leaderboard-movement-rail" aria-label="Recent movement">
              <h2>Live movement</h2>
              <div>
                {movementFeed.length > 0
                  ? movementFeed.map((item) => (
                    <span key={item.id}
                          className={item.trend === 'up' ? 'is-up' : item.trend === 'down' ? 'is-down' : 'is-flat'}>
                      {trendIcon(item.trend)} {item.username} {item.delta > 0 ? `+${item.delta}` : item.delta} to #{item.rank}
                    </span>
                  ))
                  : <span>No major movement yet this cycle.</span>}
              </div>
            </section>

            <section className="leaderboard-friends" aria-label="Friends mini leaderboard">
              <header>
                <h2>Rivalry circle</h2>
                <p>{rivalryHeadline}</p>
              </header>
              <div>
                {friendsRows.length > 0 ? (
                  friendsRows.map((entry) => (
                    <article key={entry.userId}
                             className={currentUser?.userId === entry.userId ? 'is-current-user' : undefined}>
                      <span>#{entry.rank}</span>
                      {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt={entry.username} className="leaderboard-rival-avatar"/>
                      ) : null}
                      <strong>@{entry.username}</strong>
                      <em>{formatMetric(metric, entry.metricValue)}</em>
                      <small
                        className={entry.trend === 'up' ? 'is-up' : entry.trend === 'down' ? 'is-down' : 'is-flat'}>
                        {trendIcon(entry.trend)} {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                      </small>
                    </article>
                  ))
                ) : (
                  <p>No circle data yet. Play a few races to unlock rivalry suggestions.</p>
                )}
              </div>
            </section>

            <section className="leaderboard-table"
                     aria-label={activeHubTitle ? `${activeHubTitle} leaderboard table` : 'Global leaderboard table'}>
              <header>
                <span>Rank</span>
                <span>Player</span>
                <span>Score</span>
                <span>WPM</span>
                <span>Accuracy</span>
                <span>Wins</span>
                <span>Trend</span>
              </header>
              <div>
                {pagedTableRows.map((entry) => (
                  <article
                    key={entry.userId}
                    ref={currentUser?.userId === entry.userId ? currentRowRef : undefined}
                    className={currentUser?.userId === entry.userId ? 'is-current-user' : undefined}
                  >
                    <span>#{entry.rank}</span>
                    <span className="leaderboard-table-player">
                      {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt={entry.username} className="leaderboard-table-avatar"/>
                      ) : (
                        <span
                          className="leaderboard-table-avatar-placeholder">{entry.username.charAt(0).toUpperCase()}</span>
                      )}
                      <span className="leaderboard-table-names">
                        <strong>@{entry.username}</strong>
                        {entry.displayName ? <small>{entry.displayName}</small> : null}
                      </span>
                    </span>
                    <span>{formatMetric(metric, entry.metricValue)}</span>
                    <span>{entry.bestNetWpm.toFixed(1)}</span>
                    <span>{entry.avgAccuracy.toFixed(1)}%</span>
                    <span>{entry.wins}</span>
                    <span className={entry.trend === 'up' ? 'is-up' : entry.trend === 'down' ? 'is-down' : 'is-flat'}>
                      {trendIcon(entry.trend)} {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            {totalTablePages > 1 ? (
              <div className="leaderboard-pagination" aria-label="Leaderboard table pagination">
                <button
                  type="button"
                  onClick={() => setTablePage((current) => Math.max(1, current - 1))}
                  disabled={tablePage <= 1 || loading}
                >
                  Previous
                </button>
                <div className="leaderboard-pagination-pages" role="group" aria-label="Leaderboard page numbers">
                  {tablePageNumbers[0] > 1 ? (
                    <>
                      <button type="button" onClick={() => setTablePage(1)} disabled={loading}>1</button>
                      {tablePageNumbers[0] > 2 ? <span aria-hidden="true">...</span> : null}
                    </>
                  ) : null}

                  {tablePageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setTablePage(pageNumber)}
                      disabled={loading}
                      className={pageNumber === tablePage ? 'is-active' : ''}
                      aria-current={pageNumber === tablePage ? 'page' : undefined}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  {tablePageNumbers[tablePageNumbers.length - 1] < totalTablePages ? (
                    <>
                      {tablePageNumbers[tablePageNumbers.length - 1] < totalTablePages - 1 ?
                        <span aria-hidden="true">...</span> : null}
                      <button type="button" onClick={() => setTablePage(totalTablePages)}
                              disabled={loading}>{totalTablePages}</button>
                    </>
                  ) : null}
                </div>
                <p>
                  Page <strong>{tablePage}</strong> of <strong>{totalTablePages}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setTablePage((current) => Math.min(totalTablePages, current + 1))}
                  disabled={tablePage >= totalTablePages || loading}
                >
                  Next
                </button>
              </div>
            ) : null}

            <section className="leaderboard-extras" aria-label="Rewards and rules">
              <article>
                <h2>Rank rewards</h2>
                <div className="leaderboard-rewards-grid">
                  {rewardRows.map((tier) => (
                    <section key={tier.id} className={`leaderboard-reward-card state-${tier.state}`}>
                      <p>
                        <span className="leaderboard-reward-icon">{tier.icon}</span>
                        {tier.label}
                      </p>
                      <strong>{tier.reward}</strong>
                      <span>
                        {tier.state === 'unlocked' ? 'Unlocked' : tier.state === 'next' ? `${tier.needed} ranks to unlock` : 'Locked'}
                      </span>
                    </section>
                  ))}
                </div>
              </article>
              <article>
                <h2>Rules</h2>
                <ul>
                  <li>Score uses server-authoritative race results only</li>
                  <li>Ties resolve by selected metric, then secondary performance stats</li>
                  <li>Suspicious runs can be flagged and excluded</li>
                  <li>Weekly and all-time use separate ranking windows</li>
                </ul>
              </article>
            </section>
          </>
        ) : null}
      </section>

      {!loading && !error && items.length > 0 ? (
        <section className="league-pulse" aria-label="League pulse live">
          <header className="league-pulse-head">
            <div>
              <p>Live analytics</p>
              <h2>League Pulse</h2>
            </div>
            <span>{timeframe === 'weekly' ? 'Weekly window' : 'All-time window'}</span>
          </header>

          <div className="league-pulse-kpis">
            <article>
              <span>Total races</span>
              <strong>{stats.totalRaces}</strong>
            </article>
            <article>
              <span>Ranked users</span>
              <strong>{stats.rankedPlayers}</strong>
            </article>
            <article>
              <span>New entrants</span>
              <strong>{stats.newEntrants}</strong>
            </article>
            <article>
              <span>Peak window</span>
              <strong>{stats.activeWindow}</strong>
            </article>
            <article>
              <span>Top improver</span>
              <strong>{stats.topImprover ? `@${stats.topImprover.username}` : 'n/a'}</strong>
            </article>
          </div>

          <div className="league-pulse-grid">
            <article className="league-pulse-card hubs-card">
              <h3>Top 10 most used hubs</h3>
              <div className="hub-bars">
                {stats.hubUsageTop10.length > 0 ? stats.hubUsageTop10.map((hub) => (
                  <div
                    key={hub.slug}
                    className="hub-bar-row"
                    tabIndex={0}
                    data-tooltip={`${hub.title}: ${hub.races} races (${hub.sharePercent}%)`}
                  >
                    <div>
                      <strong title={hub.title}>{compactHubLabel(hub.title)}</strong>
                      <span>{hub.races} races ({hub.sharePercent}%)</span>
                    </div>
                    <i style={{width: `${Math.max(8, Math.round((hub.races / maxHubRaces) * 100))}%`}}/>
                  </div>
                )) : <p>No hub usage data yet.</p>}
              </div>
            </article>

            <div className="league-pulse-side-col">
              <article className="league-pulse-card trend-card">
                <h3>Races trend</h3>
                <div className="chart-legend" aria-hidden="true">
                  <span><i className="legend-line"/> Races per bucket</span>
                  <span>{timeframe === 'weekly' ? 'Daily buckets' : 'Weekly buckets'}</span>
                </div>
                {trendD !== '' ? (
                  <div className="trend-chart-wrap">
                    <div className="trend-axis-y" aria-hidden="true">
                      <span>{trendMax}</span>
                      <span>{trendMid}</span>
                      <span>0</span>
                    </div>
                    <div className="trend-plot">
                      <svg viewBox="0 0 680 180" role="img" aria-label="Races trend chart">
                        <line className="trend-grid" x1="0" y1="0" x2="680" y2="0"/>
                        <line className="trend-grid" x1="0" y1="90" x2="680" y2="90"/>
                        <line className="trend-grid" x1="0" y1="180" x2="680" y2="180"/>
                        <path key={`trend-${timeframe}-${metric}`} d={trendD} className="trend-line"/>
                      </svg>
                      <div className="trend-point-layer" aria-hidden="true">
                        {trendPoints.map((point, index) => {
                          const positionClass = [
                            index === 0 ? 'is-left-edge' : '',
                            index === trendPoints.length - 1 ? 'is-right-edge' : '',
                            point.y < 22 ? 'is-top-edge' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')

                          return (
                            <button
                              key={`point-${index}-${stats.racesTrend[index]?.bucket ?? 'b'}`}
                              type="button"
                              className={`trend-point ${positionClass}`.trim()}
                              style={{left: `${(point.x / 680) * 100}%`, top: `${(point.y / 180) * 100}%`}}
                              data-tooltip={`${formatBucketLabel(stats.racesTrend[index]?.bucket ?? '')}: ${trendValues[index]} races`}
                              tabIndex={-1}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No trend data yet.</p>
                )}
                {trendTickLabels.length > 0 ? (
                  <div className="trend-axis-x" aria-hidden="true">
                    {trendTickLabels.map((tick) => (
                      <span key={tick.id}>{tick.label}</span>
                    ))}
                  </div>
                ) : null}
              </article>

              <article className="league-pulse-card tiers-card">
                <h3>Avg WPM by tier</h3>
                <div className="tier-bars">
                  {tierRows.map((tier) => (
                    <div
                      key={tier.key}
                      className={tier.key === currentTier ? 'tier-bar-col is-current-tier' : 'tier-bar-col'}
                      tabIndex={0}
                      data-tooltip={`${tier.key}: ${tier.value.toFixed(1)} WPM`}
                    >
                      <span>{tier.key}</span>
                      <i style={{height: `${Math.max(14, Math.round((tier.value / tierMax) * 120))}px`}}/>
                      <strong>{tier.value.toFixed(1)}</strong>
                      <small
                        className="tier-delta-chip">{tierDeltaLabel(tier.key as 'Gold' | 'Silver' | 'Bronze', timeframe)}</small>
                    </div>
                  ))}
                </div>
                <p className="tier-focus-note">You are currently in <strong>{currentTier}</strong> bracket.</p>
              </article>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
