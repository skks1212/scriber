import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
const glob: any = global;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!glob.prisma) {
        glob.prisma = new PrismaClient();
    }
    prisma = glob.prisma;
}

export default prisma;