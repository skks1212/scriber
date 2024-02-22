import { getUser } from "@/utils/helpers";
import { userSerializer } from "@/utils/serializers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: "Invalid Login" }, { status: 400 });
    return NextResponse.json(userSerializer(user));
}