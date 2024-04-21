import prisma from "./prisma"
import { PLayerSerializer, UserSerializer } from "./serializers"
import { getUserFromToken } from "./helpers"
import { GameStatus } from "@prisma/client"

const emitAll = (socket: any, key: string, value: string) => {
    socket.broadcast.emit(key, value)
    socket.emit(key, value)
}

export const handeConnection = async (socket: any) => {
    const query = socket.handshake.query;

    const user = await getUserFromToken(query.token)
    if (!user) {
        return
    }

    const game = await prisma.gameSession.findFirst({
        where: {
            url: query.game_url,
            status: {
                not: "FINISHED"
            }
        }
    })

    if (!game) {
        return
    }

    console.log(`User ${user.username} connected`)
    let player = await prisma.player.findFirst({
        where: {
            gameSessionId: game.id,
            userId: user.id
        }
    })

    if (player) {
        //return res.end()
    } else {
        player = await prisma.player.create({
            data: {
                gameSessionId: game.id,
                userId: user.id,
                score: 0
            }
        })
    }
    const players = await prisma.player.findMany({
        where: {
            gameSessionId: game.id
        },
        include: {
            user: true
        }
    })
    players &&
        emitAll(socket, 'users', JSON.stringify(new PLayerSerializer().serializeMany(players.map(p => ({ ...p, user: new UserSerializer().serialize(p.user) })))))

    socket.on('start', (msg: string) => {
        if (game.creatorId === user.id) {
            prisma.gameSession.update({
                where: {
                    id: game.id
                },
                data: {
                    status: GameStatus.STARTED
                }
            })
            emitAll(socket, 'game-status', "STARTED")
        }
    });

    // Listen for a disconnect event
    socket.on('disconnect', async () => {
        console.log(`User ${user.username} disconnected`);

        await prisma.player.deleteMany({
            where: {
                gameSessionId: game.id,
                user: {
                    id: user.id
                }
            }
        })
        const players = await prisma.player.findMany({
            where: {
                gameSessionId: game.id
            },
            include: {
                user: true
            }
        })
        players &&
            emitAll(socket, 'users', JSON.stringify(new PLayerSerializer().serializeMany(players.map(p => ({ ...p, user: new UserSerializer().serialize(p.user) })))))
        if (players.length === 0) {
            console.log("All players disconnected. Deleting game")
            await prisma.gameSession.delete({
                where: {
                    id: game.id
                }
            })
        } else if (game.creatorId === user.id) {
            console.log("Creator has disconnected. Assigning new creator")
            await prisma.gameSession.update({
                where: {
                    id: game.id
                },
                data: {
                    creatorId: players[0].userId
                }
            })
        }
        emitAll(socket, 'game-status', "FINISHED")
    });
}