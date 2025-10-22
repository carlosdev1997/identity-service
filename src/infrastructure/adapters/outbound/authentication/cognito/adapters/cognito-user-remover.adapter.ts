import { injectable } from 'inversify';
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoErrorHandler } from '../utils/index.js';
import type {
    AuthUserRemoverPort,
    RemoveAuthUserPortInput,
    AuthUserRemovedPortOutput,
} from '../../../../../../application/ports/outbound/authentication/index.js';
import { appContext } from '../../../../../context/index.js';

@injectable()
export class CognitoUserRemoverAdapter implements AuthUserRemoverPort {
    private client: CognitoIdentityProviderClient;

    constructor() {
        this.client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
    }

    async remove(input: RemoveAuthUserPortInput): Promise<AuthUserRemovedPortOutput> {
        try {
            const config = appContext.getConfig();

            const command = new AdminDeleteUserCommand({
                UserPoolId: config.cognitoUserPoolId,
                Username: input.externalAuthId,
            });

            await this.client.send(command);

            return { success: true };
        } catch (error) {
            throw CognitoErrorHandler.handle({
                error,
                action: 'eliminar usuario',
                component: 'CognitoUserRemoverAdapter.remove',
            });
        }
    }
}
