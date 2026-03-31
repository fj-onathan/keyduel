import {useEffect, useState} from 'react'
import {ProfileAchievements} from '../components/profile/ProfileAchievements'
import {ProfileCurriculum} from '../components/profile/ProfileCurriculum'
import {ProfileHeatmap} from '../components/profile/ProfileHeatmap'
import {ProfileHeroCard} from '../components/profile/ProfileHeroCard'
import {ProfileKeyDuelSummary} from '../components/profile/ProfileKeyDuelSummary'
import {demoProfileAchievements, demoProfileActivity, demoProfileOverview,} from '../components/profile/demoProfileData'
import type {
  ProfileAchievementsResponse,
  ProfileActivityResponse,
  ProfileOverviewResponse,
} from '../components/profile/types'
import {apiGet} from '../lib/api'
import {useParams} from 'react-router-dom'

export function ProfilePage() {
  const {username: routeUsername} = useParams<{ username: string }>()
  const [username, setUsername] = useState('client-1')
  const [profile, setProfile] = useState<ProfileOverviewResponse | null>(null)
  const [activity, setActivity] = useState<ProfileActivityResponse | null>(null)
  const [achievements, setAchievements] = useState<ProfileAchievementsResponse['items']>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = (candidateUsername?: string) => {
    const cleaned = (candidateUsername ?? username).trim()
    if (!cleaned) {
      setError('Username is required')
      return
    }

    if (cleaned.toLowerCase() === 'demo') {
      setLoading(true)
      setError('')

      const timer = window.setTimeout(() => {
        setProfile(demoProfileOverview)
        setActivity(demoProfileActivity)
        setAchievements(demoProfileAchievements.items)
        setLoading(false)
      }, 140)

      return () => {
        window.clearTimeout(timer)
      }
    }

    setLoading(true)
    setError('')

    void Promise.all([
      apiGet<ProfileOverviewResponse>(`/profile/${encodeURIComponent(cleaned)}`),
      apiGet<ProfileActivityResponse>(`/profile/${encodeURIComponent(cleaned)}/activity?range=1y`),
      apiGet<ProfileAchievementsResponse>(`/profile/${encodeURIComponent(cleaned)}/achievements`),
    ])
      .then(([profilePayload, activityPayload, achievementsPayload]) => {
        setProfile(profilePayload)
        setActivity(activityPayload)
        setAchievements(achievementsPayload.items)
      })
      .catch((err: unknown) => {
        setProfile(null)
        setActivity(null)
        setAchievements([])
        setError(err instanceof Error ? err.message : 'Failed to load profile data')
      })
      .finally(() => {
        setLoading(false)
      })

    return undefined
  }

  useEffect(() => {
    const initial = routeUsername?.trim() || username
    if (routeUsername?.trim()) {
      setUsername(routeUsername.trim())
    }
    const cleanup = load(initial)
    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUsername])

  return (
    <main className="layout mx-auto max-w-7xl px-3 sm:px-6 profile-shell">
      {loading ? <p>Loading profile...</p> : null}
      {error ? <p>{error}</p> : null}

      {!loading && !error && profile ? (
        <section className="mt-4 sm:mt-5 grid gap-3 sm:gap-4 lg:gap-5 grid-cols-1">
          <ProfileHeroCard profile={profile}/>

          {activity ? <ProfileHeatmap activity={activity}/> : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <ProfileAchievements items={achievements}/>
            <ProfileKeyDuelSummary summary={profile.summary}/>
          </div>

          <ProfileCurriculum curriculum={profile.curriculum}/>
        </section>
      ) : null}
    </main>
  )
}
