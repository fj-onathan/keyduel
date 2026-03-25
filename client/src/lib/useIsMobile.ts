import { useSyncExternalStore } from 'react'

const query = '(pointer: coarse)'

function subscribe(callback: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.matchMedia(query).matches
}

function getServerSnapshot() {
  return false
}

/**
 * Returns `true` when the primary pointing device is coarse (touch screen),
 * which is the most reliable signal that the user is on a mobile / tablet.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
