import { WebSocket } from 'ws'

export const state = {
  rooms: new Map<string, StateRoom>(),
  users: new Map<string, StateUser>(),
  winners: new Map<string, number>(),
  globalId: 0,
  globalRoomId: 0,
}

export interface StateRoom {
  id: string
  users: StateUser[]
}

export interface StateUser {
  id: string | number
  name: string
  password: string
  ws: WebSocket
  wins: number
}
