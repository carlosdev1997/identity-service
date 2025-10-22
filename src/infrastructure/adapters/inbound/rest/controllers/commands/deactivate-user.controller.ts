import type { APIGatewayProxyResult } from 'aws-lambda';
import {
    ApiResponseBuilder,
    ErrorHandler,
    InfrastructureException,
    ControllerBase,
    type AuthenticatedEvent,
} from '@companydev/shared-toolkit';
import { container } from '../../../../../di/index.js';
import { DeactivateUserUseCase } from '../../../../../../application/use-cases/commands/index.js';
import { DeactivateUserRequestSchema } from '../../dtos/requests/index.js';
import { RequestToCommandMapper, ResultToResponseMapper } from '../../mappers/index.js';

export class DeactivateUserController extends ControllerBase {
    private readonly useCase: DeactivateUserUseCase;

    constructor() {
        super();
        this.useCase = container.get(DeactivateUserUseCase);
    }

    protected async executeAuthenticated(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
        try {
            const { user } = event;
            console.log('Usuario autenticado:', { sub: user.sub, email: user.email });

            const pathParams = event.pathParameters ?? {};
            const validationResult = DeactivateUserRequestSchema.safeParse({
                userId: pathParams.id,
            });

            if (!validationResult.success) {
                throw InfrastructureException.validation({
                    message: 'El ID del usuario debe ser un UUID válido',
                    component: 'DeactivateUserController.executeAuthenticated',
                    cause: validationResult.error,
                });
            }

            const command = RequestToCommandMapper.toDeactivateUserCommand(validationResult.data);
            const result = await this.useCase.execute(command);

            const response = ResultToResponseMapper.toDeactivateUserResponse(result);
            return ApiResponseBuilder.ok(response);
        } catch (error) {
            return ErrorHandler.handle(error);
        }
    }
}
