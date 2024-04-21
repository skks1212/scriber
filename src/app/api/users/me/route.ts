import { getUser, getUserFromHeader } from "@/utils/helpers";
import prisma from "@/utils/prisma";
import { SerializerValidationError, UserSerializer } from "@/utils/serializers";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    const user = await getUserFromHeader(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    try {
        const serializer = new UserSerializer()
        await serializer.validate(body);
        const nuser = await prisma.user.findUnique({ where: { username: body.username } });
        if (nuser && nuser.id !== user.id) {
            return ["Username already taken"]
        }
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: body
        });

        return NextResponse.json(serializer.serialize(updatedUser), { status: 200 });
    } catch (error) {
        return NextResponse.json((error as SerializerValidationError).error, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    const user = await getUserFromHeader(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const serializer = new UserSerializer()
    return NextResponse.json(serializer.serialize(user), { status: 200 });
}