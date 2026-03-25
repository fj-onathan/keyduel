export type ProfileOverviewResponse = {
  identity: {
    userId: string
    email: string
    username: string
    displayName: string
    avatarUrl: string
    countryCode: string
    headline: string
    bio: string
    websiteUrl: string
    location: string
    joinedAt: string
  }
  summary: {
    racesPlayed: number
    wins: number
    bestNetWpm: number
    avgAccuracy: number
    bestStreak: number
  }
  curriculum: {
    skills: string[]
    items: Array<Record<string, unknown>>
  }
}

export type ProfileActivityCell = {
  date: string
  count: number
}

export type ProfileActivityResponse = {
  username: string
  range: string
  days: number
  totals: {
    totalRaces: number
    activeDays: number
    currentStreak: number
    longestStreak: number
  }
  cells: ProfileActivityCell[]
}

export type ProfileAchievement = {
  id: string
  hub: string
  hubTitle: string
  periodLabel: string
  rank: number
  metricType: string
  metricValue: number
  wins: number
  badgeType: 'leader' | 'top3' | 'top10'
}

export type ProfileAchievementsResponse = {
  username: string
  items: ProfileAchievement[]
}
