#!/usr/bin/env node
const { WebSocketServer } = require('ws')

const PORT = Number(process.env.PORT) || 4444
const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' })

const rooms = new Map()

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost')
  const room = url.pathname.slice(1) || 'default'
  if (!rooms.has(room)) rooms.set(room, new Set())
  const clients = rooms.get(room)
  clients.add(ws)

  ws.on('message', (data) => {
    for (const client of clients) {
      if (client !== ws && client.readyState === 1) {
        client.send(data)
      }
    }
  })

  ws.on('close', () => {
    clients.delete(ws)
    if (clients.size === 0) rooms.delete(room)
  })
})

console.log(`[y-webrtc] signaling server listening on ws://0.0.0.0:${PORT}`)
console.log(`[y-webrtc] rooms: wss://your-server:${PORT}/{room-name}`)
