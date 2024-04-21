import prisma from "./prisma";
import { cookies } from "next/headers";
import { Storage } from "@/types/storage";
import { NextApiRequest } from "next";
import { NextRequest } from "next/server";

export const getUser = async () => {
    const cookieStore = cookies();
    const cookie = cookieStore.get(
        process.env.NEXT_PUBLIC_STORAGE_COOKIE || "storage"
    );
    if (!cookie) return null;
    const storage = JSON.parse(cookie?.value || "{}") as Storage;
    if (!storage.authToken) return null;

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

export const getUserFromRequest = async (req: NextApiRequest) => {
    const cookie = req.cookies[process.env.NEXT_PUBLIC_STORAGE_COOKIE || "storage"]
    if (!cookie) return null;
    const storage = JSON.parse(cookie || "{}") as Storage;
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

export const getUserFromHeader = async (req: NextRequest) => {
    const authorization = req.headers.get("authorization");
    if (!authorization) return null;
    const token = authorization.split(" ")[1];
    if (!token) return null;
    const login = await prisma.login.findFirst({
        where: {
            token,
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

export const getUserFromToken = async (token: string) => {
    const login = await prisma.login.findFirst({
        where: {
            token,
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