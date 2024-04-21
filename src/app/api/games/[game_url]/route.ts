import prisma from "@/utils/prisma";
import { GameSerializer, PLayerSerializer, UserSerializer } from "@/utils/serializers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { game_url: string } }) {
    const { game_url } = params;
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
    });

    if (!game) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    return NextResponse.json(new GameSerializer().serialize(
        {
            ...game,
            players: new PLayerSerializer().serializeMany(game.players.map(p => ({
                ...p,
                user: new UserSerializer().serialize(p.user)
            }))),
            creator: new UserSerializer().serialize(game.creator)
        }
    ))
}