import type {ProfileOverviewResponse} from './types'

type Props = {
  profile: ProfileOverviewResponse
}

export function ProfileHeroCard({profile}: Props) {
  const avatarLetter = profile.identity.displayName?.[0]?.toUpperCase() ?? profile.identity.username?.[0]?.toUpperCase() ?? 'P'
  const joined = new Date(profile.identity.joinedAt)
  const joinedLabel = Number.isNaN(joined.getTime())
    ? 'Unknown'
    : joined.toLocaleDateString(undefined, {month: 'short', year: 'numeric'})

  return (
    <article className="profile-panel profile-top-card">
      <div className="flex items-center justify-center mt-1">
        {profile.identity.avatarUrl ? (
          <img
            src={profile.identity.avatarUrl}
            alt={`${profile.identity.displayName} avatar`}
            className="profile-hero-avatar w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
          />
        ) : (
          <div
            className="profile-hero-avatar profile-hero-avatar-fallback w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-xl sm:text-2xl md:text-3xl"
            aria-hidden="true"
          >
            {avatarLetter}
          </div>
        )}
      </div>

      <h2
        className="profile-hero-title mt-0 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
        {profile.identity.displayName}
      </h2>

      <p className="profile-hero-handle mt-1 sm:mt-2 text-sm sm:text-base">@{profile.identity.username}</p>

      {profile.identity.headline ? (
        <p className="profile-hero-headline mt-2 text-sm sm:text-base max-w-[68ch] mx-auto px-2 sm:px-0">
          {profile.identity.headline}
        </p>
      ) : null}
      {profile.identity.bio ? (
        <p className="profile-hero-bio mt-2 text-sm sm:text-base max-w-[74ch] mx-auto leading-relaxed px-2 sm:px-0">
          {profile.identity.bio}
        </p>
      ) : null}

      <p className="profile-hero-meta mt-2 text-xs sm:text-sm">
        {profile.identity.location || 'Unknown location'} • Member since {joinedLabel}
      </p>

      <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap mt-2">
        {profile.identity.websiteUrl ? (
          <span className="profile-hero-meta-tag text-[0.6rem] sm:text-[0.68rem]">{profile.identity.websiteUrl}</span>
        ) : null}
        {profile.identity.countryCode ? (
          <span
            className="profile-hero-meta-tag text-[0.6rem] sm:text-[0.68rem]">{profile.identity.countryCode.toUpperCase()}</span>
        ) : null}
      </div>
    </article>
  )
}
