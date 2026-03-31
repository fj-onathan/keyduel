import type {
  ProfileAchievementsResponse,
  ProfileActivityCell,
  ProfileActivityResponse,
  ProfileOverviewResponse,
} from './types'

const demoStartDate = new Date()
demoStartDate.setDate(demoStartDate.getDate() - 364)

function buildDemoCells(): ProfileActivityCell[] {
  const cells: ProfileActivityCell[] = []

  for (let i = 0; i < 365; i += 1) {
    const day = new Date(demoStartDate)
    day.setDate(demoStartDate.getDate() + i)

    const dayOfWeek = day.getDay()
    const seasonal = Math.sin((i / 365) * Math.PI * 2)
    const base = Math.abs(Math.sin(i * 0.47 + dayOfWeek * 0.31)) * 5
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 0
    const raw = base + seasonal + weekendBoost
    const count = Math.max(0, Math.min(8, Math.floor(raw)))

    cells.push({
      date: day.toISOString().slice(0, 10),
      count,
    })
  }

  return cells
}

const activityCells = buildDemoCells()

export const demoProfileOverview: ProfileOverviewResponse = {
  identity: {
    userId: 'demo-user-id',
    email: 'demo@keyduel.dev',
    username: 'demo',
    displayName: 'Sara Nova',
    avatarUrl: '/avatar/s12312abewq.png',
    countryCode: 'PT',
    headline: 'Go-focused race specialist and typing coach',
    bio: 'I build fast backend systems, mentor new racers, and run weekly typing clinics for competitive coding teams.',
    websiteUrl: 'https://saranova.dev',
    location: 'Lisbon, Portugal',
    joinedAt: '2025-02-14T10:30:00Z',
  },
  summary: {
    racesPlayed: 1824,
    wins: 716,
    bestNetWpm: 128.6,
    avgAccuracy: 98.7,
    bestStreak: 29,
  },
  curriculum: {
    skills: ['Go', 'TypeScript', 'Rust', 'PostgreSQL', 'Redis', 'WebSockets', 'Mentoring'],
    items: [
      {
        type: 'work',
        title: 'Senior Backend Engineer',
        org: 'Velocity Labs',
        period: '2023 - Present',
        description: 'Lead race-event infrastructure and latency optimization for multiplayer coding games.',
      },
      {
        type: 'work',
        title: 'Platform Engineer',
        org: 'CodeArena',
        period: '2021 - 2023',
        description: 'Built leaderboards, profile telemetry, and ranking pipelines for 500k monthly users.',
      },
      {
        type: 'project',
        title: 'Open Heatmap Toolkit',
        org: 'OSS',
        period: '2024',
        description: 'Maintainer of a lightweight contribution/activity heatmap package for React apps.',
      },
      {
        type: 'community',
        title: 'Typing Coach',
        org: 'Hub Sprint Club',
        period: '2022 - Present',
        description: 'Host monthly review sessions focused on rhythm, error reduction, and race strategy.',
      },
    ],
  },
}

export const demoProfileActivity: ProfileActivityResponse = {
  username: 'demo',
  range: '1y',
  days: 365,
  totals: {
    totalRaces: activityCells.reduce((sum, item) => sum + item.count, 0),
    activeDays: activityCells.filter((item) => item.count > 0).length,
    currentStreak: 11,
    longestStreak: 29,
  },
  cells: activityCells,
}

export const demoProfileAchievements: ProfileAchievementsResponse = {
  username: 'demo',
  items: [
    {
      id: 'go-2026-02',
      hub: 'go',
      hubTitle: 'Go Hub',
      periodLabel: 'Feb 2026',
      rank: 1,
      metricType: 'wins',
      metricValue: 64,
      wins: 64,
      badgeType: 'leader'
    },
    {
      id: 'rust-2026-01',
      hub: 'rust',
      hubTitle: 'Rust Hub',
      periodLabel: 'Jan 2026',
      rank: 2,
      metricType: 'wins',
      metricValue: 51,
      wins: 51,
      badgeType: 'top3'
    },
    {
      id: 'typescript-2025-12',
      hub: 'typescript',
      hubTitle: 'TypeScript Hub',
      periodLabel: 'Dec 2025',
      rank: 1,
      metricType: 'speed',
      metricValue: 121.4,
      wins: 46,
      badgeType: 'leader'
    },
    {
      id: 'python-2025-11',
      hub: 'python',
      hubTitle: 'Python Hub',
      periodLabel: 'Nov 2025',
      rank: 3,
      metricType: 'wins',
      metricValue: 42,
      wins: 42,
      badgeType: 'top3'
    },
    {
      id: 'javascript-2025-10',
      hub: 'javascript',
      hubTitle: 'JavaScript Hub',
      periodLabel: 'Oct 2025',
      rank: 7,
      metricType: 'accuracy',
      metricValue: 99.1,
      wins: 24,
      badgeType: 'top10'
    },
  ],
}
