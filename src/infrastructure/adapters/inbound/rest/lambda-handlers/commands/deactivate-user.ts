import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HandlerHelper } from '../helpers/index.js';
import { DeactivateUserController } from '../../controllers/commands/index.js';

const controller = new DeactivateUserController();

export const handler = (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return HandlerHelper.withAuth(controller, event);
};
