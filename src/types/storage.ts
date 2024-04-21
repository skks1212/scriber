import { User } from "@prisma/client";

export type Storage = {
    authToken?: string,
    user?: Partial<User>,
    sounds?: {
        volume?: number
        pack?: string
    }
}