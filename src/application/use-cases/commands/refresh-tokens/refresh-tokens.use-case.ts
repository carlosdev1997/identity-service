import { injectable, inject } from 'inversify';
import { UseCaseBase, ApplicationException } from '@companydev/shared-toolkit';
import type { RefreshTokensCommand } from '../../../ports/inbound/commands/index.js';
import type { AuthUserAuthenticatorPort } from '../../../ports/outbound/authentication/index.js';
import { RefreshTokensResult } from './refresh-tokens.result.js';

@injectable()
export class RefreshTokensUseCase extends UseCaseBase<RefreshTokensCommand, RefreshTokensResult> {
    constructor(
        @inject('AuthUserAuthenticatorPort') private readonly authUserAuthenticator: AuthUserAuthenticatorPort
    ) {
        super();
    }

    async execute(command: RefreshTokensCommand): Promise<RefreshTokensResult> {
        const authResult = await this.authUserAuthenticator.refreshTokens({
            refreshToken: command.refreshToken,
        });

        if (!authResult.accessToken || !authResult.idToken) {
            throw ApplicationException.inconsistency({
                message: 'Respuesta de autenticación incompleta',
                component: 'RefreshTokensUseCase',
            });
        }

        return {
            accessToken: authResult.accessToken,
            idToken: authResult.idToken,
            expiresIn: authResult.expiresIn ?? 3600,
        };
    }
}
