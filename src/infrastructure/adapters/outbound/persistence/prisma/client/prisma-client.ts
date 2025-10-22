import { PrismaClient } from '@prisma/client';
import { appContext } from '../../../../../context/index.js';

let prismaClient: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
    if (!prismaClient) {
        const config = appContext.getConfig();
        prismaClient = new PrismaClient({
            datasources: {
                db: {
                    url: config.databaseUrl,
                },
            },
        });
    }
    return prismaClient;
};
