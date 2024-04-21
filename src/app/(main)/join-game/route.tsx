import prisma from "@/utils/prisma";
import { GameStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const randomGame = await prisma.gameSession.findFirst({
        where: {
            status: GameStatus.WAITING
        }
    })
    if (!randomGame) {
        return redirect('/new-game')
    }
    redirect(`/play/${randomGame.url}`)
}