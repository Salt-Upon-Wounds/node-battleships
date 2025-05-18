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
  data?: string
  id: number
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
