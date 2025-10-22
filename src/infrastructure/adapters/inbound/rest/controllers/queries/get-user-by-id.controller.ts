import type { APIGatewayProxyResult } from 'aws-lambda';
import {
    ApiResponseBuilder,
    ErrorHandler,
    InfrastructureException,
    ControllerBase,
    type AuthenticatedEvent,
} from '@companydev/shared-toolkit';
import { container } from '../../../../../di/index.js';
import { GetUserByIdUseCase } from '../../../../../../application/use-cases/queries/index.js';
import { GetUserByIdRequestSchema } from '../../dtos/requests/index.js';
import { RequestToQueryMapper, ResultToResponseMapper } from '../../mappers/index.js';

export class GetUserByIdController extends ControllerBase {
    private readonly useCase: GetUserByIdUseCase;

    constructor() {
        super();
        this.useCase = container.get(GetUserByIdUseCase);
    }

    protected async executeAuthenticated(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
        try {
            const { user } = event;
            console.log('Usuario autenticado:', { sub: user.sub, email: user.email });

            const pathParams = event.pathParameters ?? {};
            const validationResult = GetUserByIdRequestSchema.safeParse({
                userId: pathParams.id,
            });

            if (!validationResult.success) {
                throw InfrastructureException.validation({
                    message: 'El ID del usuario debe ser un UUID válido',
                    component: 'GetUserByIdController.executeAuthenticated',
                    cause: validationResult.error,
                });
            }

            const query = RequestToQueryMapper.toGetUserByIdQuery(validationResult.data);
            const result = await this.useCase.execute(query);

            const response = ResultToResponseMapper.toGetUserResponse(result);
            return ApiResponseBuilder.ok(response);
        } catch (error) {
            return ErrorHandler.handle(error);
        }
    }
}
