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

export function getPlayerById(id: string) {
  return Array.from(state.users.values()).find((p) => p.id.toString() === id)
}

export function sendRoomList(wss: WebSocketServer) {
  const rooms = JSON.stringify(
    Array.from(state.rooms.values()).map((room) => ({
      roomId: room.id,
      roomUsers: room.users.map((p) => ({ name: p.name, index: p.id })),
    }))
  )

  const message = JSON.stringify({ type: 'update_room', data: rooms, id: 0 })
  broadcast(wss, message)
}
