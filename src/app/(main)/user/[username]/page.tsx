import prisma from "@/utils/prisma"
import UserClient from "./client"
import { notFound } from "next/navigation"
import { UserSerializer } from "@/utils/serializers"

export default async function User({ params }: { params: { username: string } }) {

    const { username } = params

    const rawUser = await prisma.user.findUnique({
        where: {
            username
        }
    })

    if (!rawUser) {
        notFound()
    }

    return <UserClient user={new UserSerializer().serialize(rawUser)} />
}