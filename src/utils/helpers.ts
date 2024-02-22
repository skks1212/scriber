import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";

export const getUser = async (req: NextRequest) => {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
        NextResponse.json({
            error: "No Authorization header found",
        }, {
            status: 401,
        });
        return false;
    }
    const token = authorization.replace("Token ", "");
    const login = await prisma.login.findFirst({
        where: {
            token: token,
        },
    });
    if (!login || !login.userId) {
        NextResponse.json({
            error: "Invalid Token"
        }, {
            status: 400,
        });
        return false;
    }
    const user = await prisma.user.findUnique({
        where: {
            id: login.userId,
        },
    });

    if (!user) {
        NextResponse.json({
            error: "User not found"
        }, {
            status: 400,
        });
        return false;
    }

    return user;
}