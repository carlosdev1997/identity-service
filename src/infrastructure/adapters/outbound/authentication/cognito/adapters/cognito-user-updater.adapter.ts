import { injectable } from 'inversify';
import {
    CognitoIdentityProviderClient,
    AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoErrorHandler } from '../utils/index.js';
import type {
    AuthUserUpdaterPort,
    UpdateAuthUserPortInput,
    AuthUserUpdatedPortOutput,
} from '../../../../../../application/ports/outbound/authentication/index.js';
import { appContext } from '../../../../../context/index.js';

@injectable()
export class CognitoUserUpdaterAdapter implements AuthUserUpdaterPort {
    private client: CognitoIdentityProviderClient;

    constructor() {
        this.client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
    }

    async update(input: UpdateAuthUserPortInput): Promise<AuthUserUpdatedPortOutput> {
        try {
            const config = appContext.getConfig();

            const userAttributes = [];

            if (input.fullName) {
                userAttributes.push({ Name: 'name', Value: input.fullName });
            }

            if (userAttributes.length === 0) {
                return { success: true };
            }

            const command = new AdminUpdateUserAttributesCommand({
                UserPoolId: config.cognitoUserPoolId,
                Username: input.externalAuthId,
                UserAttributes: userAttributes,
            });

            await this.client.send(command);

            return { success: true };
        } catch (error) {
            throw CognitoErrorHandler.handle({
                error,
                action: 'actualizar usuario',
                component: 'CognitoUserUpdaterAdapter.update',
            });
        }
    }
}
