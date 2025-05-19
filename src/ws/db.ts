import { WebSocket } from 'ws'

export const state = {
  rooms: new Map<string, StateRoom>(),
  users: new Map<string, StateUser>(),
  winners: new Map<string, number>(),
  games: new Map<string, Game>(),
  globalId: 0,
  globalRoomId: 0,
}

export interface StateRoom {
  id: string
  users: StateUser[]
}

export interface Game {
  ships: {
    [playerId: string]: Ship[]
  }
  hits: {
    [playerId: string]: Set<string>
  }
  currentPlayerId: string | number
}

export interface Ship {
  position: Position
  direction: boolean
  length: number
  type: ShipType
}

export interface Position {
  x: number
  y: number
}

export type ShipType = 'small' | 'medium' | 'large' | 'huge'

export interface StateUser {
  id: string | number
  name: string
  password: string
  ws: WebSocket
  wins: number
}
