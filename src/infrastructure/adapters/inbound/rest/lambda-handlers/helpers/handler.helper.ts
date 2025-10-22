import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { ControllerBase } from '@companydev/shared-toolkit';
import { appContext } from '../../../../../context/index.js';

export class HandlerHelper {
    /**
     * Ejecuta un controlador SIN autenticación (público)
     * IMPORTANTE: También inicializa el appContext porque los controladores
     * públicos pueden necesitar acceso a la base de datos u otros recursos
     */
    static async withoutAuth(controller: ControllerBase, event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        await appContext.initialize();
        return controller.withoutAuth(event);
    }

    /**
     * Ejecuta un controlador CON autenticación
     * Inicializa automáticamente el appContext y carga la configuración
     */
    static async withAuth(
        controller: ControllerBase,
        event: APIGatewayProxyEvent,
        tokenUse: 'access' | 'id' = 'access'
    ): Promise<APIGatewayProxyResult> {
        await appContext.initialize();
        const config = appContext.getConfig();

        return controller.withAuth(
            event,
            {
                cognitoUserPoolId: config.cognitoUserPoolId,
                cognitoClientId: config.cognitoClientId,
            },
            tokenUse
        );
    }
}
