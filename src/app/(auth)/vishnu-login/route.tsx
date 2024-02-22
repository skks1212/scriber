import { Storage } from "@/types/storage";
import prisma from "@/utils/prisma";
import usernameGenerator from "@/assets/generators/username.json"

import { cookies } from "next/headers";
import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {

    const cookieStore = cookies();

    const setStorage = (newStorage: Storage) => {
        cookieStore.set(process.env.NEXT_PUBLIC_STORAGE_COOKIE || "storage", JSON.stringify(newStorage));
    }

    const { searchParams } = new URL(req.url)

    const login_token = searchParams.get("token")
    const success = searchParams.get("success")

    if (success === "false") {
        return NextResponse.json({
            error: "Login Failed"
        }, {
            status: 400,
        });
    }

    const userDataRequest = await fetch("https://auth-api.writeroo.net/users/token?token=" + login_token, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.VISHNU_API_KEY || "",
        },
    });

    const userData = await userDataRequest.json();
    const fetchedUser = userData.user;
    const login = await prisma.login.findFirst({
        where: {
            serviceToken: userData.service_token,
            success: false,
        },
    });

    if (!login) {
        return NextResponse.json({
            error: "Invalid Login Token"
        }, {
            status: 400,
        });
    }

    let user = await prisma.user.findUnique({
        where: {
            email: fetchedUser.email,
        },
    });

    if (!user) {

        const firstNames = usernameGenerator[0];
        const secondNames = usernameGenerator[1];
        const thirdNames = usernameGenerator[2];

        const name = firstNames[Math.floor(Math.random() * firstNames.length)] + "-" + secondNames[Math.floor(Math.random() * secondNames.length)] + "-" + thirdNames[Math.floor(Math.random() * thirdNames.length)];

        user = await prisma.user.create({
            data: {
                email: fetchedUser.email,
                username: name,
                vishnu_id: fetchedUser.external_id,
            },
        });
    }

    const token = crypto.randomBytes(64).toString("hex");

    await prisma.login.update({
        where: {
            id: login.id,
        },
        data: {
            success: true,
            userId: user.id,
            token,
        },
    });

    setStorage({
        authToken: token,
        user,
    });

    redirect("/")
}