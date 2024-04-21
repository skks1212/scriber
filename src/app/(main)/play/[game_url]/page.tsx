import prisma from "@/utils/prisma"
import PlayPageClient from "./client"
import { notFound } from "next/navigation"
import { GameSerializer } from "@/utils/serializers"

export default async function PlayPage({ params }: { params: { game_url: string } }) {

    const { game_url } = params

    const game = await prisma.gameSession.findFirst({
        where: {
            url: game_url
        },
        include: {
            players: {
                include: {
                    user: true
                }
            },
            creator: true
        }
    })

    if (!game) {
        notFound()
    }

    const serialized = await new GameSerializer().serialize(game)

    return (
        <PlayPageClient game={serialized} />
    )
}