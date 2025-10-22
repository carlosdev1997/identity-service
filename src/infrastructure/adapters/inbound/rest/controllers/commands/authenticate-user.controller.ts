import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ApiResponseBuilder, ErrorHandler, InfrastructureException, ControllerBase } from '@companydev/shared-toolkit';
import { container } from '../../../../../di/index.js';
import { AuthenticateUserUseCase } from '../../../../../../application/use-cases/commands/index.js';
import { AuthenticateUserRequestSchema } from '../../dtos/requests/index.js';
import { RequestToCommandMapper, ResultToResponseMapper } from '../../mappers/index.js';

export class AuthenticateUserController extends ControllerBase {
    private readonly useCase: AuthenticateUserUseCase;

    constructor() {
        super();
        this.useCase = container.get(AuthenticateUserUseCase);
    }

    protected async executePublic(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        try {
            const body = this.parseBody(event.body);
            const validationResult = AuthenticateUserRequestSchema.safeParse(body);

            if (!validationResult.success) {
                throw InfrastructureException.validation({
                    message: 'Error de validación en los datos enviados',
                    component: 'AuthenticateUserController.executePublic',
                    cause: validationResult.error,
                });
            }

            const command = RequestToCommandMapper.toAuthenticateUserCommand(validationResult.data);
            const result = await this.useCase.execute(command);

            const response = ResultToResponseMapper.toAuthenticateUserResponse(result);
            return ApiResponseBuilder.ok(response);
        } catch (error) {
            return ErrorHandler.handle(error);
        }
    }
}
