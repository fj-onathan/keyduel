import {env} from '../config/env'

export function createRaceSocket(): WebSocket {
  return new WebSocket(env.wsBaseUrl)
}
