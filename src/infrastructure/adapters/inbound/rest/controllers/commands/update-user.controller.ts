import type { APIGatewayProxyResult } from 'aws-lambda';
import {
    ApiResponseBuilder,
    ErrorHandler,
    InfrastructureException,
    ControllerBase,
    type AuthenticatedEvent,
} from '@companydev/shared-toolkit';
import { container } from '../../../../../di/index.js';
import { UpdateUserUseCase } from '../../../../../../application/use-cases/commands/index.js';
import { UpdateUserRequestSchema } from '../../dtos/requests/index.js';
import { RequestToCommandMapper, ResultToResponseMapper } from '../../mappers/index.js';
import { z } from 'zod';

export class UpdateUserController extends ControllerBase {
    private readonly useCase: UpdateUserUseCase;

    constructor() {
        super();
        this.useCase = container.get(UpdateUserUseCase);
    }

    protected async executeAuthenticated(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
        try {
            const { user } = event;
            console.log('Usuario autenticado:', { sub: user.sub, email: user.email });

            const pathParams = event.pathParameters ?? {};
            const userId = this.validateUserId(pathParams.id);

            const body = this.parseBody(event.body);
            const validationResult = UpdateUserRequestSchema.safeParse(body);

            if (!validationResult.success) {
                throw InfrastructureException.validation({
                    message: 'Error de validación en los datos enviados',
                    component: 'UpdateUserController.executeAuthenticated',
                    cause: validationResult.error,
                });
            }

            const command = RequestToCommandMapper.toUpdateUserCommand(userId, validationResult.data);
            const result = await this.useCase.execute(command);

            const response = ResultToResponseMapper.toUpdateUserResponse(result);
            return ApiResponseBuilder.ok(response);
        } catch (error) {
            return ErrorHandler.handle(error);
        }
    }

    private validateUserId(id: string | undefined): string {
        try {
            return z.string().uuid().parse(id);
        } catch (err) {
            throw InfrastructureException.validation({
                message: 'El ID del usuario debe ser un UUID válido',
                component: 'UpdateUserController.validateUserId',
                cause: err as Error,
            });
        }
    }
}
