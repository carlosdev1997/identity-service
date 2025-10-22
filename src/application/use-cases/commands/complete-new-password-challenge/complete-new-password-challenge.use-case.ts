import { injectable, inject } from 'inversify';
import { UseCaseBase, ApplicationException } from '@companydev/shared-toolkit';
import type { CompleteNewPasswordChallengeCommand } from '../../../ports/inbound/commands/index.js';
import type { AuthUserAuthenticatorPort } from '../../../ports/outbound/authentication/index.js';
import { CompleteNewPasswordChallengeResult } from './complete-new-password-challenge.result.js';
import { PortToDomainMapper } from '../../../mappers/port-to-domain.mapper.js';
import { EventPublisherPort } from '../../../ports/outbound/messaging/index.js';
import type { UserReaderPort } from '../../../ports/outbound/persistence/index.js';

@injectable()
export class CompleteNewPasswordChallengeUseCase extends UseCaseBase<
    CompleteNewPasswordChallengeCommand,
    CompleteNewPasswordChallengeResult
> {
    constructor(
        @inject('AuthUserAuthenticatorPort') private readonly authUserAuthenticator: AuthUserAuthenticatorPort,
        @inject('UserReaderPort') private readonly userReader: UserReaderPort,
        @inject('EventPublisherPort') private readonly eventPublisher: EventPublisherPort
    ) {
        super();
    }

    async execute(command: CompleteNewPasswordChallengeCommand): Promise<CompleteNewPasswordChallengeResult> {
        const userFound = await this.userReader.findByEmail({ email: command.email });
        if (!userFound) {
            throw ApplicationException.entityNotFound({
                entityName: 'Usuario',
                identifier: command.email,
                identifierType: 'email',
                showIdentifier: true,
                component: 'CompleteNewPasswordChallengeUseCase',
            });
        }

        const authResult = await this.authUserAuthenticator.completeNewPasswordChallenge({
            email: command.email,
            newPassword: command.newPassword,
            session: command.session,
        });

        if (!authResult.accessToken || !authResult.idToken || !authResult.refreshToken) {
            throw ApplicationException.inconsistency({
                message: 'Respuesta de autenticación incompleta',
                component: 'CompleteNewPasswordChallengeUseCase',
            });
        }

        const userAggregate = PortToDomainMapper.toUserAggregate(userFound);
        userAggregate.changePassword(); // Esto agrega PasswordChangedEvent

        // 4. Publicar eventos de dominio
        const events = userAggregate.pullDomainEvents();
        for (const event of events) {
            await this.eventPublisher.publish({
                eventName: event.eventName,
                payload: event.toPrimitives(),
            });
        }

        return {
            accessToken: authResult.accessToken,
            idToken: authResult.idToken,
            refreshToken: authResult.refreshToken,
            expiresIn: authResult.expiresIn ?? 3600,
        };
    }
}
