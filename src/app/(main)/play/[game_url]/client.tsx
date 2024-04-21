"use client";

import ProfilePicture from "@/components/profilepicture";
import Input from "@/components/ui/input";
import { SOUNDS } from "@/utils/constants";
import { storageAtom } from "@/utils/store";
import { GameSession, GameStatus, Player, User } from "@prisma/client"
import io from 'Socket.IO-client'
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useSound } from "@/utils/hooks";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/utils/api";
import { notFound } from "next/navigation";
let socket: any;

export default function PlayPageClient(props: {
    game: any
}) {

    const { game: gameinit } = props
    const gameQuery = useQuery<GameSession>({
        queryKey: ["game", gameinit.url],
        queryFn: () => API.game.fetch(gameinit.url),
        initialData: gameinit
    })
    const game = gameQuery.data;
    const [players, setPlayers] = useState<(Player & { user: User })[]>([])
    const [storage, setStorage] = useAtom(storageAtom)
    const playSound = useSound()

    const handlePlayersUpdate = (players: (Player & { user: User })[]) => {
        console.log(players)
        setPlayers(players)
    }

    const startSocket = async () => {
        await fetch(`/api/game/${game?.url}/socket`)
        socket = io({
            query: {
                token: storage.authToken,
                game_url: game?.url
            }
        });

        socket.on('users', (message: string) => {
            handlePlayersUpdate(JSON.parse(message) as (Player & { user: User })[])
            playSound(SOUNDS.playerJoin)
        });
    }

    useEffect(() => {
        startSocket();

        return () => {
            socket?.off('connection');
            socket?.off('message');
            socket?.disconnect();
        };

    }, [game?.url]);

    useEffect(() => {
        if (game?.status !== GameStatus.WAITING) {
            socket?.disconnect()
            notFound()
        }
    }, []);

    return (
        <div className="h-[calc(100vh-70px)] flex">
            <div>
                <h2 className="text-2xl font-bold">
                    {game?.status === GameStatus.WAITING && "Waiting for players"}
                </h2>
                <div>
                    {players.map(p => (
                        <div key={p.id} className="p-4 flex items-center gap-4 font-black">
                            <ProfilePicture className="w-10" user={p.user} />
                            {p.user.username}
                            <span className="text-yellow-500">
                                {p.score}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-full gap-5 flex-col hidden">
                <div className="bg-gray-900 w-[500px] aspect-square rounded-xl">

                </div>
                <div className="h-64">

                </div>
            </div>
            <div>

            </div>
        </div>
    )
}