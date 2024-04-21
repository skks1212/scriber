"use server"

import { NextApiRequest, NextApiResponse } from 'next'
import type { Server as HTTPServer } from "http"
import type { Socket as NetSocket } from "net"
import type { Server as IOServer } from "socket.io"
import { Server } from "socket.io"
import { getUserFromRequest } from '@/utils/helpers'
import prisma from '@/utils/prisma'
import { GameStatus } from '@prisma/client'
import { handeConnection } from '@/utils/socket'

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

const SocketHandler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  const gameUrl = req.query.game_url as string
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' })
    res.end()
    return
  }

  const game = await prisma.gameSession.findFirst({
    where: {
      url: gameUrl,
      status: {
        not: GameStatus.FINISHED
      }
    }
  })

  if (!game) {
    res.status(404).json({ message: 'Game not found' })
    res.end()
    return
  }

  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.socket.server.io.removeAllListeners("connection")
    res.socket.server.io.on("connection", (socket) => handeConnection(socket as any))
    res.end()
    return
  }
  console.log('Socket is initializing')
  const io = new Server(res.socket.server)
  res.socket.server.io = io
  res.socket.server.io.on('connection', (socket) => handeConnection(socket as any));
  res.end()
}

export default SocketHandler