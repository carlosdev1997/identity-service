import type { UserAggregate } from '../../domain/user/index.js';
import type { CreateUserPortInput, UpdateUserPortInput } from '../ports/outbound/persistence/index.js';

export class DomainToPortMapper {
    static toCreateUserPortInput(aggregate: UserAggregate): CreateUserPortInput {
        return {
            id: aggregate.getId().toString(),
            email: aggregate.getEmail().toString(),
            fullName: aggregate.getFullName().toString(),
            status: aggregate.getStatus().toNumber(),
            externalAuthId: aggregate.getExternalAuthId().toString(),
            createdAt: aggregate.getCreatedAt(),
            updatedAt: aggregate.getUpdatedAt(),
        };
    }

    static toUpdateUserPortInput(aggregate: UserAggregate): UpdateUserPortInput {
        return {
            id: aggregate.getId().toString(),
            fullName: aggregate.getFullName().toString(),
            status: aggregate.getStatus().toNumber(),
            updatedAt: aggregate.getUpdatedAt(),
        };
    }
}
