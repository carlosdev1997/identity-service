import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HandlerHelper } from '../helpers/index.js';
import { CompleteNewPasswordChallengeController } from '../../controllers/commands/index.js';

const controller = new CompleteNewPasswordChallengeController();

export const handler = (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return HandlerHelper.withoutAuth(controller, event);
};
