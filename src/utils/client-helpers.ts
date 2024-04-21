export const playSound = (url: string) => {
    const soundPack = "default"
    const audio = new Audio(`/sounds/${soundPack}/${url}`);
    audio.play();
}