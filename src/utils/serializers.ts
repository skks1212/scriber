import { User } from "@prisma/client";

export function userSerializer(user: User): Partial<User> {
    return {
        username: user.username,
        email: user.email,
        profile_picture_url: user.profile_picture_url,
    }
}