import prisma from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const client_url = protocol + "://" + req.headers.get("host")

    const serviceTokenRequest = await fetch("https://auth-api.writeroo.net/servicetoken", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.VISHNU_API_KEY || "",
        },
        body: JSON.stringify({
            success_url: client_url + "/vishnu-login?success=true&token=[token]",
            failure_url: client_url + "/vishnu-login?success=false",
        }),
    });

    const { token: service_token, url }: { token: string, url: string } = await serviceTokenRequest.json();

    await prisma.login.create({
        data: {
            serviceToken: service_token,
        },
    });

    return NextResponse.redirect(url);
}