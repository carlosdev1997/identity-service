import { injectable } from 'inversify';
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import type {
    AuthUserAuthenticatorPort,
    AuthenticateUserPortInput,
    CompleteNewPasswordChallengePortInput,
    RefreshTokensPortInput,
    UserAuthenticatedPortOutput,
} from '../../../../../../application/ports/outbound/authentication/index.js';
import { appContext } from '../../../../../context/index.js';
import { SecretHashCalculator, CognitoErrorHandler } from '../utils/index.js';

@injectable()
export class CognitoUserAuthenticatorAdapter implements AuthUserAuthenticatorPort {
    private client: CognitoIdentityProviderClient;

    constructor() {
        this.client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
    }

    async authenticate(input: AuthenticateUserPortInput): Promise<UserAuthenticatedPortOutput> {
        try {
            const config = appContext.getConfig();
            const secretHash = SecretHashCalculator.calculate(
                input.email,
                config.cognitoClientId,
                config.cognitoClientSecret
            );

            const command = new InitiateAuthCommand({
                ClientId: config.cognitoClientId,
                AuthFlow: 'USER_PASSWORD_AUTH',
                AuthParameters: {
                    USERNAME: input.email,
                    PASSWORD: input.password,
                    SECRET_HASH: secretHash,
                },
            });

            const response = await this.client.send(command);

            if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
                return {
                    challengeName: response.ChallengeName,
                    session: response.Session,
                };
            }

            return {
                accessToken: response.AuthenticationResult?.AccessToken,
                idToken: response.AuthenticationResult?.IdToken,
                refreshToken: response.AuthenticationResult?.RefreshToken,
                expiresIn: response.AuthenticationResult?.ExpiresIn,
            };
        } catch (error) {
            throw CognitoErrorHandler.handle({
                error,
                action: 'autenticar usuario',
                component: 'CognitoUserAuthenticatorAdapter.authenticate',
            });
        }
    }

    async completeNewPasswordChallenge(
        input: CompleteNewPasswordChallengePortInput
    ): Promise<UserAuthenticatedPortOutput> {
        try {
            const config = appContext.getConfig();
            const secretHash = SecretHashCalculator.calculate(
                input.email,
                config.cognitoClientId,
                config.cognitoClientSecret
            );

            const command = new RespondToAuthChallengeCommand({
                ClientId: config.cognitoClientId,
                ChallengeName: 'NEW_PASSWORD_REQUIRED',
                Session: input.session,
                ChallengeResponses: {
                    USERNAME: input.email,
                    NEW_PASSWORD: input.newPassword,
                    SECRET_HASH: secretHash,
                },
            });

            const response = await this.client.send(command);

            return {
                accessToken: response.AuthenticationResult?.AccessToken,
                idToken: response.AuthenticationResult?.IdToken,
                refreshToken: response.AuthenticationResult?.RefreshToken,
                expiresIn: response.AuthenticationResult?.ExpiresIn,
            };
        } catch (error) {
            throw CognitoErrorHandler.handle({
                error,
                action: 'completar cambio de contraseña',
                component: 'CognitoUserAuthenticatorAdapter.completeNewPasswordChallenge',
            });
        }
    }

    async refreshTokens(input: RefreshTokensPortInput): Promise<UserAuthenticatedPortOutput> {
        try {
            const config = appContext.getConfig();

            const command = new InitiateAuthCommand({
                ClientId: config.cognitoClientId,
                AuthFlow: 'REFRESH_TOKEN_AUTH',
                AuthParameters: {
                    REFRESH_TOKEN: input.refreshToken,
                },
            });

            const response = await this.client.send(command);

            return {
                accessToken: response.AuthenticationResult?.AccessToken,
                idToken: response.AuthenticationResult?.IdToken,
                expiresIn: response.AuthenticationResult?.ExpiresIn,
            };
        } catch (error) {
            throw CognitoErrorHandler.handle({
                error,
                action: 'refrescar tokens',
                component: 'CognitoUserAuthenticatorAdapter.refreshTokens',
            });
        }
    }
}
