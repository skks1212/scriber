import prisma from "./prisma";
import { cookies } from "next/headers";
import { Storage } from "@/types/storage";

export const getUser = async () => {
    const cookieStore = cookies();
    const cookie = cookieStore.get(
        process.env.NEXT_PUBLIC_STORAGE_COOKIE || "storage"
    );
    const storage = JSON.parse(cookie?.value || "{}") as Storage;

    const login = await prisma.login.findFirst({
        where: {
            token: storage.authToken,
            success: true,
        },
    });

    if (!login || !login.userId) return null;

    const user = await prisma.user.findUnique({
        where: {
            id: login.userId,
        },
    });

    if (!user) {
        return null;
    }

    return user;
}
