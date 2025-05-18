import { WebSocket } from 'ws'
import { Data } from '../types'

export function handleMessage(ws: WebSocket, message: Data) {
  console.log('Received:', message)

  switch (message.type) {
    case 'reg':
      ws.send(
        JSON.stringify({
          type: 'reg',
          data: {
            name: message.data!.name,
            index: Date.now(),
            error: false,
            errorText: '',
          },
          id: 0,
        })
      )
      break

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
