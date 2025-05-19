import { WebSocket, WebSocketServer } from 'ws'
import { Data } from '../types'
import { state } from './db'
import {
  attack,
  generateBotShips,
  getPlayerById,
  getPlayerBySocket,
  sendRoomList,
  sendWinnersList,
} from './utils'

export function handleMessage(ws: WebSocket, message: Data, wss: WebSocketServer) {
  console.log('Received:', message)

  switch (message.type) {
    case 'reg': {
      const { name, password } = JSON.parse(message.data!)
      let user = state.users.get(name!)
      let error = false
      let errorText = ''

      if (user) {
        if (user.password !== password) {
          error = true
          errorText = 'Wrong password'
        } else {
          user.ws = ws
        }
      } else {
        if (!name || !password) {
          error = true
          errorText = 'Empty name or password'
        } else {
          user = {
            name,
            password,
            ws,
            id: state.globalId++,
          }
          state.users.set(name, user)
          state.winners.set(name, 0)
        }
      }

      ws.send(
        JSON.stringify({
          type: 'reg',
          data: JSON.stringify({
            name,
            index: user?.id,
            error,
            errorText,
          }),
          id: 0,
        })
      )

      sendRoomList(wss)
      sendWinnersList(wss)
      break
    }

    case 'create_room': {
      const player = getPlayerBySocket(ws)
      if (!player) break

      const roomId = `${state.globalRoomId++}`
      const room = { id: roomId, users: [player] }
      state.rooms.set(roomId, room)

      sendRoomList(wss)
      break
    }

    case 'add_user_to_room': {
      const player = getPlayerBySocket(ws)
      if (!player) break

      const { indexRoom } = JSON.parse(message.data!)
      const room = state.rooms.get(String(indexRoom))
      if (!room || room.users.length !== 1 || room.users.includes(player)) break

      room.users.push(player)

      state.rooms.delete(indexRoom)

      for (const p of room.users.values()) {
        p.ws?.send(
          JSON.stringify({
            type: 'create_game',
            data: JSON.stringify({
              idGame: indexRoom,
              idPlayer: p.id,
            }),
            id: 0,
          })
        )
      }

      sendRoomList(wss)
      break
    }

    case 'add_ships': {
      const { gameId, ships, indexPlayer } = JSON.parse(message.data!)
      const game =
        state.games.get(gameId) ??
        state.games.set(gameId, { ships: {}, hits: {}, currentPlayerId: indexPlayer }).get(gameId)!
      game.ships[indexPlayer] ??= ships
      game.hits[indexPlayer] ??= new Set<string>()
      if (Object.entries(game.ships).length === 2) {
        for (const [id, sh] of Object.entries(game.ships)) {
          getPlayerById(id)!.ws?.send(
            JSON.stringify({
              type: 'start_game',
              data: JSON.stringify({
                ships: sh,
                currentPlayerIndex: game.currentPlayerId,
              }),
              id: 0,
            })
          )
        }
      }
      break
    }

    case 'attack': {
      const { gameId, x, y, indexPlayer } = JSON.parse(message.data!)
      attack(gameId, indexPlayer, wss, x, y)
      break
    }

    case 'randomAttack': {
      const { gameId, indexPlayer } = JSON.parse(message.data!)
      attack(gameId, indexPlayer, wss)
      break
    }

    case 'single_play': {
      const player = getPlayerBySocket(ws)!
      const botPlayer = state.users.get('BOT')!
      const gameId = crypto.randomUUID()

      const botShips = generateBotShips()
      console.log('botShips:', botShips)

      state.games.set(gameId, {
        ships: { [botPlayer.id]: botShips },
        hits: { [botPlayer.id]: new Set<string>() },
        currentPlayerId: player.id,
      })

      ws.send(
        JSON.stringify({
          type: 'create_game',
          data: JSON.stringify({
            idGame: gameId,
            idPlayer: player.id,
          }),
          id: 0,
        })
      )

      break
    }

    default:
      ws.send(
        JSON.stringify({
          type: 'error',
          data: 'Unknown message type',
          id: 0,
        })
      )
  }
}
