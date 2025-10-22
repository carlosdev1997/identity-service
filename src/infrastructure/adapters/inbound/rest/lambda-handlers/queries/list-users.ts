import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HandlerHelper } from '../helpers/index.js';
import { ListUsersController } from '../../controllers/queries/index.js';

const controller = new ListUsersController();

export const handler = (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return HandlerHelper.withAuth(controller, event);
};
