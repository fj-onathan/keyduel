import { useState, useEffect } from "react";

const REPO_OWNER = "fj-onathan";
const REPO_NAME = "keyduel";
const CACHE_KEY = "gh-stars";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CachedStars {
  count: number;
  ts: number;
}

function formatStarCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return count.toString();
}

async function fetchAndCache(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const count: number = data.stargazers_count;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ count, ts: Date.now() }));
    return count;
  } catch {
    return null;
  }
}

/**
 * Fetches the GitHub star count for the KeyDuel repo.
 * Caches in localStorage for 1 hour with stale-while-revalidate.
 * Returns { count, formatted } or null values if unavailable.
 */
export function useGitHubStars() {
  const [count, setCount] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) return (JSON.parse(raw) as CachedStars).count;
    } catch {
      /* ignore */
    }
    return null;
  });

  useEffect(() => {
    let cancelled = false;

    // Check if the cached value is still fresh — if so, skip fetching.
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed: CachedStars = JSON.parse(cached);
        if (Date.now() - parsed.ts <= CACHE_TTL) return;
      } catch {
        /* ignore, will fetch */
      }
    }

    fetchAndCache().then((n) => {
      if (!cancelled && n !== null) setCount(n);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    count,
    formatted: count !== null ? formatStarCount(count) : null,
    repoUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
  };
}
