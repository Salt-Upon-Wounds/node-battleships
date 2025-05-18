import { WebSocketServer } from 'ws'
import { config } from 'dotenv'
import { handleMessage } from './messageHandler'

config()

const port = Number(process.env.PORT) || 3000

const wss = new WebSocketServer({ port }, () => {
  console.log(`WebSocket server started on ws://localhost:${port}`)
})

wss.on('connection', (ws) => {
  console.log('New client connected')

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString())
      handleMessage(ws, parsed)
    } catch (e) {
      console.error('Invalid JSON received', e)
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})
