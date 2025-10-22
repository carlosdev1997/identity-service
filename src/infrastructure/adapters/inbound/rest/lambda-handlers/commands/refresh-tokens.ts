import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HandlerHelper } from '../helpers/index.js';
import { RefreshTokensController } from '../../controllers/commands/index.js';

const controller = new RefreshTokensController();

export const handler = (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return HandlerHelper.withAuth(controller, event);
};
