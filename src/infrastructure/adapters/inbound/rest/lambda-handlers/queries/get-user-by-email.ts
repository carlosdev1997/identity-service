import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HandlerHelper } from '../helpers/index.js';
import { GetUserByEmailController } from '../../controllers/queries/index.js';

const controller = new GetUserByEmailController();

export const handler = (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return HandlerHelper.withAuth(controller, event);
};
