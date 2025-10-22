import { injectable, inject } from 'inversify';
import { UseCaseBase, ApplicationException } from '@companydev/shared-toolkit';
import type { GetUserByIdQuery } from '../../../ports/inbound/queries/index.js';
import type { UserReaderPort } from '../../../ports/outbound/persistence/index.js';
import { PortToDomainMapper } from '../../../mappers/index.js';
import { GetUserByIdResult } from './get-user-by-id.result.js';

@injectable()
export class GetUserByIdUseCase extends UseCaseBase<GetUserByIdQuery, GetUserByIdResult> {
    constructor(@inject('UserReaderPort') private readonly userReader: UserReaderPort) {
        super();
    }

    async execute(query: GetUserByIdQuery): Promise<GetUserByIdResult> {
        const userFound = await this.userReader.findById({ userId: query.userId });
        if (!userFound) {
            throw ApplicationException.entityNotFound({
                entityName: 'Usuario',
                identifier: query.userId,
                showIdentifier: false,
                component: 'GetUserByIdUseCase',
            });
        }

        const userAggregate = PortToDomainMapper.toUserAggregate(userFound);

        return {
            id: userAggregate.getId().toString(),
            email: userAggregate.getEmail().toString(),
            fullName: userAggregate.getFullName().toString(),
            status: userAggregate.getStatus().toString(),
            externalAuthId: userAggregate.getExternalAuthId().toString(),
            createdAt: userAggregate.getCreatedAt(),
            updatedAt: userAggregate.getUpdatedAt(),
        };
    }
}
