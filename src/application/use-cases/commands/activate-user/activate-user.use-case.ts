import { injectable, inject } from 'inversify';
import { UseCaseBase, ApplicationException } from '@companydev/shared-toolkit';
import type { ActivateUserCommand } from '../../../ports/inbound/commands/index.js';
import type { UserReaderPort, UserWriterPort } from '../../../ports/outbound/persistence/index.js';
import type { AuthUserExistenceCheckerPort } from '../../../ports/outbound/authentication/index.js';
import { DomainToPortMapper, PortToDomainMapper } from '../../../mappers/index.js';
import type { ActivateUserResult } from './activate-user.result.js';

@injectable()
export class ActivateUserUseCase extends UseCaseBase<ActivateUserCommand, ActivateUserResult> {
    constructor(
        @inject('UserReaderPort') private readonly userReader: UserReaderPort,
        @inject('AuthUserExistenceCheckerPort') private readonly authUserExistenceChecker: AuthUserExistenceCheckerPort,
        @inject('UserWriterPort') private readonly userWriter: UserWriterPort
    ) {
        super();
    }

    async execute(command: ActivateUserCommand): Promise<ActivateUserResult> {
        const userFound = await this.userReader.findById({ userId: command.userId });
        if (!userFound) {
            throw ApplicationException.entityNotFound({
                entityName: 'Usuario',
                identifier: command.userId,
                showIdentifier: false,
                component: 'ActivateUserUseCase',
            });
        }

        const userAggregate = PortToDomainMapper.toUserAggregate(userFound);

        const authUserExists = await this.authUserExistenceChecker.check({
            externalAuthId: userAggregate.getExternalAuthId().toString(),
        });

        if (!authUserExists.exists) {
            throw ApplicationException.inconsistency({
                message: `Usuario existe en BD pero no en Cognito: ${command.userId}`,
                component: 'ActivateUserUseCase',
            });
        }

        userAggregate.activate();

        await this.userWriter.update(DomainToPortMapper.toUpdateUserPortInput(userAggregate));

        return {
            id: userAggregate.getId().toString(),
            status: userAggregate.getStatus().toString(),
            updatedAt: userAggregate.getUpdatedAt(),
        };
    }
}
