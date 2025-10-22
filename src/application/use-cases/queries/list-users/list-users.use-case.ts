import { injectable, inject } from 'inversify';
import { UseCaseBase } from '@companydev/shared-toolkit';
import type { ListUsersQuery } from '../../../ports/inbound/queries/index.js';
import type { UserReaderPort } from '../../../ports/outbound/persistence/index.js';
import { PortToDomainMapper } from '../../../mappers/index.js';
import { ListUsersResult } from './list-users.result.js';

@injectable()
export class ListUsersUseCase extends UseCaseBase<ListUsersQuery, ListUsersResult> {
    constructor(@inject('UserReaderPort') private readonly userReader: UserReaderPort) {
        super();
    }

    async execute(query: ListUsersQuery): Promise<ListUsersResult> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        const result = await this.userReader.findAll({
            status: query.status,
            page,
            limit,
        });

        const totalPages = Math.ceil(result.total / limit);

        return {
            users: result.users.map(user => {
                const userAggregate = PortToDomainMapper.toUserAggregate(user);
                return {
                    id: userAggregate.getId().toString(),
                    email: userAggregate.getEmail().toString(),
                    fullName: userAggregate.getFullName().toString(),
                    status: userAggregate.getStatus().toString(),
                    createdAt: userAggregate.getCreatedAt(),
                };
            }),
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages,
            },
        };
    }
}
