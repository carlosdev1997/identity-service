import { UserAggregate } from '../../domain/user/index.js';
import type { UserFoundPortOutput } from '../ports/outbound/persistence/index.js';

export class PortToDomainMapper {
    static toUserAggregate(output: UserFoundPortOutput): UserAggregate {
        return UserAggregate.reconstitute({
            id: output.id,
            email: output.email,
            fullName: output.fullName,
            status: output.status,
            externalAuthId: output.externalAuthId,
            createdAt: output.createdAt,
            updatedAt: output.updatedAt,
        });
    }
}
