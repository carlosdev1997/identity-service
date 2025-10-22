import { injectable, inject } from 'inversify';
import { UseCaseBase, ApplicationException } from '@companydev/shared-toolkit';
import type { GetUserByEmailQuery } from '../../../ports/inbound/queries/index.js';
import type { UserReaderPort } from '../../../ports/outbound/persistence/index.js';
import { PortToDomainMapper } from '../../../mappers/index.js';
import { GetUserByEmailResult } from './get-user-by-email.result.js';

@injectable()
export class GetUserByEmailUseCase extends UseCaseBase<GetUserByEmailQuery, GetUserByEmailResult> {
    constructor(@inject('UserReaderPort') private readonly userReader: UserReaderPort) {
        super();
    }

    async execute(query: GetUserByEmailQuery): Promise<GetUserByEmailResult> {
        const userFound = await this.userReader.findByEmail({ email: query.email });
        if (!userFound) {
            throw ApplicationException.entityNotFound({
                entityName: 'Usuario',
                identifier: query.email,
                identifierType: 'email',
                showIdentifier: true,
                component: 'GetUserByEmailUseCase',
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
