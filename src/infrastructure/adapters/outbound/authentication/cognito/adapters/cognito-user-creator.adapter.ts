import { injectable } from 'inversify';
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import type {
    AuthUserCreatorPort,
    CreateAuthUserPortInput,
    AuthUserCreatedPortOutput,
} from '../../../../../../application/ports/outbound/authentication/index.js';
import { appContext } from '../../../../../context/index.js';
import { CognitoErrorHandler } from '../utils/index.js';

@injectable()
export class CognitoUserCreatorAdapter implements AuthUserCreatorPort {
    private client: CognitoIdentityProviderClient;

    constructor() {
        this.client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
    }

    async create(input: CreateAuthUserPortInput): Promise<AuthUserCreatedPortOutput> {
        try {
            const config = appContext.getConfig();

            console.log('🔍 Creando usuario en Cognito:', {
                userPoolId: config.cognitoUserPoolId,
                email: input.email,
            });

            const command = new AdminCreateUserCommand({
                UserPoolId: config.cognitoUserPoolId,
                Username: input.email,
                UserAttributes: [
                    { Name: 'email', Value: input.email },
                    { Name: 'email_verified', Value: 'true' },
                    { Name: 'name', Value: input.fullName },
                ],
                DesiredDeliveryMediums: ['EMAIL'],
            });

            const response = await this.client.send(command);

            const sub = response.User?.Attributes?.find(attr => attr.Name === 'sub')?.Value;

            if (!sub) {
                throw new Error('No se pudo obtener el ID de usuario de Cognito');
            }

            return { externalAuthId: sub };
        } catch (error) {
            throw CognitoErrorHandler.handle({
                error,
                action: 'crear usuario',
                component: 'CognitoUserCreatorAdapter.create',
            });
        }
    }
}
