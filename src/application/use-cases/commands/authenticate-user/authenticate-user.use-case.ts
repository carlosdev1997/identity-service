import { injectable, inject } from 'inversify';
import { UseCaseBase, ApplicationException } from '@companydev/shared-toolkit';
import type { AuthenticateUserCommand } from '../../../ports/inbound/commands/index.js';
import type { UserReaderPort } from '../../../ports/outbound/persistence/index.js';
import type { AuthUserAuthenticatorPort } from '../../../ports/outbound/authentication/index.js';
import { PortToDomainMapper } from '../../../mappers/index.js';
import { AuthenticateUserResult } from './authenticate-user.result.js';

@injectable()
export class AuthenticateUserUseCase extends UseCaseBase<AuthenticateUserCommand, AuthenticateUserResult> {
    constructor(
        @inject('UserReaderPort') private readonly userReader: UserReaderPort,
        @inject('AuthUserAuthenticatorPort') private readonly authUserAuthenticator: AuthUserAuthenticatorPort
    ) {
        super();
    }

    async execute(command: AuthenticateUserCommand): Promise<AuthenticateUserResult> {
        const userFound = await this.userReader.findByEmail({ email: command.email });
        if (!userFound) {
            throw ApplicationException.entityNotFound({
                entityName: 'Usuario',
                identifier: command.email,
                identifierType: 'email',
                showIdentifier: true,
                component: 'AuthenticateUserUseCase',
            });
        }

        const userAggregate = PortToDomainMapper.toUserAggregate(userFound);

        if (userAggregate.getStatus().isInactive()) {
            throw ApplicationException.userNotActive({
                userId: userAggregate.getId().toString(),
                component: 'AuthenticateUserUseCase',
            });
        }

        const authResult = await this.authUserAuthenticator.authenticate({
            email: command.email,
            password: command.password,
        });

        return authResult;
    }
}
