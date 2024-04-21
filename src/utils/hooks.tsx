"use client"

import { useAtom } from "jotai"
import { storageAtom } from "./store"

export function useSound() {

    const [storage, setStorage] = useAtom(storageAtom);

    const playSound = (sound: string) => {

        const volume = storage.sounds?.volume || 100;
        const pack = storage.sounds?.pack || "default";

        const audio = new Audio(`/sounds/${pack}/${sound}`);
        audio.volume = volume / 100;
        audio.play();
    }

    return playSound;
}