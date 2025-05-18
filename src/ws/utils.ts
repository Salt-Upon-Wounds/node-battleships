import { WebSocketServer, WebSocket } from 'ws'
import { state } from './db'

export function broadcast(wss: WebSocketServer, msg: string) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg)
    }
  }
}

export function getPlayerBySocket(ws: WebSocket) {
  return Array.from(state.users.values()).find((p) => p.ws === ws)
}
