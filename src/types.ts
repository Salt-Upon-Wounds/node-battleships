export type DataType =
  | 'reg'
  | 'update_winners'
  | 'create_room'
  | 'add_user_to_room'
  | 'create_game'
  | 'update_room'
  | 'add_ships'
  | 'start_game'
  | 'attack'
  | 'randomAttack'
  | 'turn'
  | 'finish'
export interface Data {
  type: DataType
  data?: {
    name?: string
    password?: string
    error?: boolean
    errorText?: string
    wins?: number
    indexRoom?: number | string
    idGame?: number | string
    idPlayer?: number | string
    roomUsers?: User[]
    gameId?: number | string
    ships?: Ship[]
    indexPlayer?: number | string
    currentPlayerIndex?: number | string
    x: number
    y: number
    winPlayer: number | string
  }
  id: number
}

export interface User {
  name: string
  index: number | string
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
