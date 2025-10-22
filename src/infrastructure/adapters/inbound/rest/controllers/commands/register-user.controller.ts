import type { APIGatewayProxyResult } from 'aws-lambda';
import {
    ApiResponseBuilder,
    ErrorHandler,
    InfrastructureException,
    ControllerBase,
    type AuthenticatedEvent,
} from '@companydev/shared-toolkit';
import { container } from '../../../../../di/index.js';
import { RegisterUserUseCase } from '../../../../../../application/use-cases/commands/index.js';
import { RegisterUserRequestSchema } from '../../dtos/requests/index.js';
import { RequestToCommandMapper, ResultToResponseMapper } from '../../mappers/index.js';

export class RegisterUserController extends ControllerBase {
    private readonly useCase: RegisterUserUseCase;

    constructor() {
        super();
        this.useCase = container.get(RegisterUserUseCase);
    }

    protected async executeAuthenticated(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
        try {
            const body = this.parseBody(event.body);
            const validationResult = RegisterUserRequestSchema.safeParse(body);

            if (!validationResult.success) {
                throw InfrastructureException.validation({
                    message: 'Error de validación en los datos enviados',
                    component: 'RegisterUserController.executePublic',
                    cause: validationResult.error,
                });
            }

            const command = RequestToCommandMapper.toRegisterUserCommand(validationResult.data);
            const result = await this.useCase.execute(command);

            const response = ResultToResponseMapper.toRegisterUserResponse(result);
            return ApiResponseBuilder.created(response);
        } catch (error) {
            return ErrorHandler.handle(error);
        }
    }
}
