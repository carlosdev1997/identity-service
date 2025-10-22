import { injectable } from 'inversify';
import { type User } from '@prisma/client';
import { InfrastructureException } from '@companydev/shared-toolkit';
import type {
    UserReaderPort,
    GetUserByIdPortInput,
    GetUserByEmailPortInput,
    ListUsersPortInput,
    UserFoundPortOutput,
    UsersListPortOutput,
} from '../../../../../../application/ports/outbound/persistence/index.js';
import { getPrismaClient } from '../client/prisma-client.js';

@injectable()
export class PrismaUserReaderAdapter implements UserReaderPort {
    async findById(input: GetUserByIdPortInput): Promise<UserFoundPortOutput | null> {
        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({
                where: { id: input.userId },
            });

            return user ? this.toPortOutput(user) : null;
        } catch (error) {
            throw InfrastructureException.database({
                message: 'Error al buscar usuario por ID',
                component: 'PrismaUserReaderAdapter.findById',
                cause: error as Error,
            });
        }
    }

    async findByEmail(input: GetUserByEmailPortInput): Promise<UserFoundPortOutput | null> {
        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.findUnique({
                where: { email: input.email },
            });

            return user ? this.toPortOutput(user) : null;
        } catch (error) {
            throw InfrastructureException.database({
                message: 'Error al buscar usuario por email',
                component: 'PrismaUserReaderAdapter.findByEmail',
                cause: error as Error,
            });
        }
    }

    async findAll(input: ListUsersPortInput): Promise<UsersListPortOutput> {
        try {
            const prisma = getPrismaClient();
            const where = input.status !== undefined ? { status: input.status } : {};
            const skip = (input.page - 1) * input.limit;

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take: input.limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.user.count({ where }),
            ]);

            return {
                users: users.map(user => this.toPortOutput(user)),
                total,
            };
        } catch (error) {
            throw InfrastructureException.database({
                message: 'Error al listar usuarios',
                component: 'PrismaUserReaderAdapter.findAll',
                cause: error as Error,
            });
        }
    }

    private toPortOutput(user: User): UserFoundPortOutput {
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            status: user.status,
            externalAuthId: user.externalAuthId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
