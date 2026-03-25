const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:8081/ws'
const raceEngineBaseUrl = import.meta.env.VITE_RACE_ENGINE_BASE_URL ?? 'http://localhost:8081'

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'KeyDuel',
  apiBaseUrl,
  wsBaseUrl,
  raceEngineBaseUrl,
}
