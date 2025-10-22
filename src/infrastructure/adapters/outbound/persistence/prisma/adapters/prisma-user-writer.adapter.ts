import { injectable } from 'inversify';
import { type User } from '@prisma/client';
import { InfrastructureException } from '@companydev/shared-toolkit';
import type {
    UserWriterPort,
    CreateUserPortInput,
    UpdateUserPortInput,
    UserWrittenPortOutput,
} from '../../../../../../application/ports/outbound/persistence/index.js';
import { getPrismaClient } from '../client/prisma-client.js';

@injectable()
export class PrismaUserWriterAdapter implements UserWriterPort {
    async create(input: CreateUserPortInput): Promise<UserWrittenPortOutput> {
        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.create({
                data: {
                    id: input.id,
                    email: input.email,
                    fullName: input.fullName,
                    status: input.status,
                    externalAuthId: input.externalAuthId,
                    createdAt: input.createdAt,
                    updatedAt: input.updatedAt,
                },
            });

            return this.toPortOutput(user);
        } catch (error) {
            throw InfrastructureException.database({
                message: 'Error al crear usuario',
                component: 'PrismaUserWriterAdapter.create',
                cause: error as Error,
            });
        }
    }

    async update(input: UpdateUserPortInput): Promise<UserWrittenPortOutput> {
        try {
            const prisma = getPrismaClient();
            const user = await prisma.user.update({
                where: { id: input.id },
                data: {
                    fullName: input.fullName,
                    status: input.status,
                    updatedAt: input.updatedAt,
                },
            });

            return this.toPortOutput(user);
        } catch (error) {
            throw InfrastructureException.database({
                message: 'Error al actualizar usuario',
                component: 'PrismaUserWriterAdapter.update',
                cause: error as Error,
            });
        }
    }

    private toPortOutput(user: User): UserWrittenPortOutput {
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
