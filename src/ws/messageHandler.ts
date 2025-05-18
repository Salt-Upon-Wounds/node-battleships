import { WebSocket, WebSocketServer } from 'ws'
import { Data } from '../types'
import { state } from './db'
import { getPlayerBySocket, sendRoomList } from './utils'

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
            wins: 0,
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

      break
    }

    case 'create_room': {
      const player = getPlayerBySocket(ws)
      if (!player) return

      const roomId = `${state.globalRoomId++}`
      const room = { id: roomId, users: [player] }
      state.rooms.set(roomId, room)

      sendRoomList(wss)
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
