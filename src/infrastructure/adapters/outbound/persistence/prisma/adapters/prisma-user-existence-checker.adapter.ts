import { injectable } from 'inversify';
import { getPrismaClient } from '../client/prisma-client.js';
import { InfrastructureException } from '@companydev/shared-toolkit';
import type {
    UserExistenceCheckerPort,
    CheckUserExistencePortInput,
    UserExistencePortOutput,
} from '../../../../../../application/ports/outbound/persistence/index.js';

@injectable()
export class PrismaUserExistenceCheckerAdapter implements UserExistenceCheckerPort {
    async check(input: CheckUserExistencePortInput): Promise<UserExistencePortOutput> {
        try {
            const prisma = getPrismaClient();
            const count = await prisma.user.count({
                where: { email: input.email },
            });

            return { exists: count > 0 };
        } catch (error) {
            throw InfrastructureException.database({
                message: 'Error al verificar existencia de usuario',
                component: 'PrismaUserExistenceCheckerAdapter.check',
                cause: error as Error,
            });
        }
    }
}
