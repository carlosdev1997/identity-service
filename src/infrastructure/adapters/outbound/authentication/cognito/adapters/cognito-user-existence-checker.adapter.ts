import { injectable } from 'inversify';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoErrorHandler } from '../utils/index.js';
import type {
    AuthUserExistenceCheckerPort,
    CheckAuthUserExistencePortInput,
    AuthUserExistencePortOutput,
} from '../../../../../../application/ports/outbound/authentication/index.js';
import { appContext } from '../../../../../context/index.js';

@injectable()
export class CognitoUserExistenceCheckerAdapter implements AuthUserExistenceCheckerPort {
    private client: CognitoIdentityProviderClient;

    constructor() {
        this.client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
    }

    async check(input: CheckAuthUserExistencePortInput): Promise<AuthUserExistencePortOutput> {
        try {
            const config = appContext.getConfig();
            const username = input.email ?? input.externalAuthId;

            if (!username) {
                throw new Error('Se requiere email o externalAuthId para verificar existencia');
            }

            const command = new AdminGetUserCommand({
                UserPoolId: config.cognitoUserPoolId,
                Username: username,
            });

            await this.client.send(command);
            return { exists: true };
        } catch (error) {
            const err = error as { name?: string };
            if (err.name === 'UserNotFoundException') {
                return { exists: false };
            }
            throw CognitoErrorHandler.handle({
                error,
                action: 'verificar existencia de usuario',
                component: 'CognitoUserExistenceCheckerAdapter.check',
            });
        }
    }
}
