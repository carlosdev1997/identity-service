import { injectable, inject } from 'inversify';
import { UseCaseBase, ApplicationException } from '@companydev/shared-toolkit';
import type { DeactivateUserCommand } from '../../../ports/inbound/commands/index.js';
import type { UserReaderPort, UserWriterPort } from '../../../ports/outbound/persistence/index.js';
import type { AuthUserExistenceCheckerPort } from '../../../ports/outbound/authentication/index.js';
import { DomainToPortMapper, PortToDomainMapper } from '../../../mappers/index.js';
import type { DeactivateUserResult } from './deactivate-user.result.js';

@injectable()
export class DeactivateUserUseCase extends UseCaseBase<DeactivateUserCommand, DeactivateUserResult> {
    constructor(
        @inject('UserReaderPort') private readonly userReader: UserReaderPort,
        @inject('AuthUserExistenceCheckerPort') private readonly authUserExistenceChecker: AuthUserExistenceCheckerPort,
        @inject('UserWriterPort') private readonly userWriter: UserWriterPort
    ) {
        super();
    }

    async execute(command: DeactivateUserCommand): Promise<DeactivateUserResult> {
        const userFound = await this.userReader.findById({ userId: command.userId });
        if (!userFound) {
            throw ApplicationException.entityNotFound({
                entityName: 'Usuario',
                identifier: command.userId,
                showIdentifier: false,
                component: 'DeactivateUserUseCase',
            });
        }

        const userAggregate = PortToDomainMapper.toUserAggregate(userFound);

        const authUserExists = await this.authUserExistenceChecker.check({
            externalAuthId: userAggregate.getExternalAuthId().toString(),
        });

        if (!authUserExists.exists) {
            throw ApplicationException.inconsistency({
                message: `Usuario existe en BD pero no en Cognito: ${command.userId}`,
                component: 'DeactivateUserUseCase',
            });
        }

        userAggregate.deactivate();

        await this.userWriter.update(DomainToPortMapper.toUpdateUserPortInput(userAggregate));

        return {
            id: userAggregate.getId().toString(),
            status: userAggregate.getStatus().toString(),
            updatedAt: userAggregate.getUpdatedAt(),
        };
    }
}
