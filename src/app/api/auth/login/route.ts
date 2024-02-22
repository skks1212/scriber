import prisma from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";
import usernameGenerator from "@/assets/generators/username.json"
import crypto from "crypto";
import { userSerializer } from "@/utils/serializers";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const client_url = searchParams.get("client_url");
    const redirect_url = searchParams.get("redirect_url");

    try {

        const serviceTokenRequest = await fetch("https://auth-api.writeroo.net/servicetoken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": process.env.VISHNU_API_KEY || "",
            },
            body: JSON.stringify({
                success_url: client_url + "/vishnu-login?success=true&token=[token]" + (redirect_url ? ("&redirect_url=" + redirect_url) : ""),
                failure_url: client_url + "/vishnu-login?success=false",
            }),
        });

        const { token: service_token, url }: { token: string, url: string } = await serviceTokenRequest.json();

        await prisma.login.create({
            data: {
                serviceToken: service_token,
            },
        });

        return NextResponse.json({
            url,
            service_token,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: "Failed to initiate Vishnu Login. Please try again later."
        }, {
            status: 500,
        });
    }
}

export async function POST(req: NextRequest) {
    const { login_token } = await req.json();

    // validate login token from Vishnu
    const userDataRequest = await fetch("https://auth-api.writeroo.net/users/token?token=" + login_token, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.VISHNU_API_KEY || "",
        },
    });

    const userData = await userDataRequest.json();
    console.log(userData);
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

    return NextResponse.json({
        token,
        user: userSerializer(user),
    });

}