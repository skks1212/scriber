import { getUser } from "@/utils/helpers";
import prisma from "@/utils/prisma";
import { GameStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
    const user = await getUser();

    if (!user) {
        redirect("/login");
    }

    // check for any existing games
    const existingGame = await prisma.gameSession.findFirst({
        where: {
            creatorId: user.id,
            status: {
                not: GameStatus.FINISHED
            }
        }
    })

    if (existingGame) {
        redirect(`/play/${existingGame.url}`);
    }

    const randomUrl = Math.random().toString(36).substring(7);

    const newGame = await prisma.gameSession.create({
        data: {
            creatorId: user.id,
            url: randomUrl,
        }
    })

    await prisma.player.create({
        data: {
            gameSessionId: newGame.id,
            userId: user.id,
            score: 0,
        }
    })

    redirect(`/play/${newGame.url}`);
}