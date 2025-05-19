import { WebSocketServer, WebSocket } from 'ws'
import { Position, Ship, state } from './db'

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

export function getShipCells(ship: Ship): Position[] {
  const cells = []
  for (let i = 0; i < ship.length; i++) {
    const dx = ship.direction ? i : 0
    const dy = ship.direction ? 0 : i
    cells.push({ x: ship.position.x + dx, y: ship.position.y + dy })
  }
  return cells
}

export function attack(gameId: string, indexPlayer: string, x?: number, y?: number) {
  const game = state.games.get(gameId)
  if (!game || game.currentPlayerId !== indexPlayer) return

  const opponentId = Object.keys(game).find((id) => id !== indexPlayer)
  if (!opponentId) return

  let shotKey: string

  if (Number.isInteger(x) && Number.isInteger(y)) {
    shotKey = `${x},${y}`
  } else {
    const freeCells = []
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const key = `${x},${y}`
        if (!game.hits[opponentId].has(key)) {
          freeCells.push({ x, y })
        }
      }
    }
    const target = freeCells[Math.floor(Math.random() * freeCells.length)]
    if (!target) return
    shotKey = `${target.x},${target.y}`
  }

  const wasHit = game.ships[opponentId].some((ship) => {
    const cells = getShipCells(ship)
    return cells.some((c) => c.x === x && c.y === y)
  })

  let status: 'miss' | 'shot' | 'killed' = 'miss'

  if (wasHit) {
    game.hits[opponentId].add(shotKey)

    const killed = game.ships[opponentId].find((ship) =>
      getShipCells(ship).every((c) => game.hits[opponentId].has(`${c.x},${c.y}`))
    )

    status = killed ? 'killed' : 'shot'
    if (killed) {
      const around = getAroundCells(killed)
      for (const cell of around) {
        const key = `${cell.x},${cell.y}`
        if (!game.hits[opponentId].has(key)) {
          game.hits[opponentId].add(key)

          for (const p of Object.keys(game.ships)) {
            getPlayerById(p)!.ws.send(
              JSON.stringify({
                type: 'attack',
                data: {
                  position: { x: cell.x, y: cell.y },
                  currentPlayer: indexPlayer,
                  status: 'miss',
                },
                id: 0,
              })
            )
          }
        }
      }
    }
  }

  for (const p of Object.keys(game.ships)) {
    getPlayerById(p)!.ws.send(
      JSON.stringify({
        type: 'attack',
        data: JSON.stringify({
          position: { x, y },
          currentPlayer: indexPlayer,
          status,
        }),
        id: 0,
      })
    )
  }

  const allDead = game.ships[opponentId].every((ship) =>
    getShipCells(ship).every((c) => game.hits[opponentId].has(`${c.x},${c.y}`))
  )

  if (allDead) {
    for (const p of Object.keys(game.ships)) {
      getPlayerById(p)!.ws.send(
        JSON.stringify({
          type: 'finish',
          data: JSON.stringify({ winPlayer: indexPlayer }),
          id: 0,
        })
      )
    }
    state.games.delete(gameId)
    return
  }

  if (status === 'miss') {
    game.currentPlayerId = opponentId

    for (const p of Object.keys(game.ships)) {
      getPlayerById(p)!.ws.send(
        JSON.stringify({
          type: 'turn',
          data: JSON.stringify({ currentPlayer: game.currentPlayerId }),
          id: 0,
        })
      )
    }
  }
  return
}

export function getAroundCells(ship: Ship): Position[] {
  const cells = getShipCells(ship)
  const result = new Set<string>()

  for (const cell of cells) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = cell.x + dx
        const ny = cell.y + dy
        if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
          result.add(`${nx},${ny}`)
        }
      }
    }
  }

  for (const cell of cells) {
    result.delete(`${cell.x},${cell.y}`)
  }

  return Array.from(result).map((k) => {
    const [x, y] = k.split(',').map(Number)
    return { x, y }
  })
}
