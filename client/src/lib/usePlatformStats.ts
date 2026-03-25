import { useEffect, useRef, useState } from 'react'
import { env } from '../config/env'

export type PlatformStats = {
  onlinePlayers: number
  activeHubs: number
  totalRaces: number
  races24h: number
}

const initialStats: PlatformStats = {
  onlinePlayers: 0,
  activeHubs: 0,
  totalRaces: 0,
  races24h: 0,
}

/**
 * Subscribes to the /platform-stats SSE stream.
 * Returns live stats that update every ~10 seconds.
 * Auto-reconnects on connection loss (built into EventSource).
 */
export function usePlatformStats(): PlatformStats {
  const [stats, setStats] = useState<PlatformStats>(initialStats)
  const sourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const url = `${env.apiBaseUrl}/platform-stats`
    const source = new EventSource(url, { withCredentials: true })
    sourceRef.current = source

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as PlatformStats
        setStats(data)
      } catch {
        // ignore malformed events
      }
    }

    source.onerror = () => {
      // EventSource auto-reconnects; nothing to do here.
    }

    return () => {
      source.close()
      sourceRef.current = null
    }
  }, [])

  return stats
}
