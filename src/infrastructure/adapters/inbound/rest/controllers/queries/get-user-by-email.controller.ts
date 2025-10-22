import type { APIGatewayProxyResult } from 'aws-lambda';
import {
    ApiResponseBuilder,
    ErrorHandler,
    InfrastructureException,
    ControllerBase,
    type AuthenticatedEvent,
} from '@companydev/shared-toolkit';
import { container } from '../../../../../di/index.js';
import { GetUserByEmailUseCase } from '../../../../../../application/use-cases/queries/index.js';
import { GetUserByEmailRequestSchema } from '../../dtos/requests/index.js';
import { RequestToQueryMapper, ResultToResponseMapper } from '../../mappers/index.js';

export class GetUserByEmailController extends ControllerBase {
    private readonly useCase: GetUserByEmailUseCase;

    constructor() {
        super();
        this.useCase = container.get(GetUserByEmailUseCase);
    }

    protected async executeAuthenticated(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
        try {
            const { user } = event;
            console.log('Usuario autenticado:', { sub: user.sub, email: user.email });

            const queryParams = event.queryStringParameters ?? {};
            const validationResult = GetUserByEmailRequestSchema.safeParse({
                email: queryParams.email,
            });

            if (!validationResult.success) {
                throw InfrastructureException.validation({
                    message: 'El email proporcionado no es válido',
                    component: 'GetUserByEmailController.executeAuthenticated',
                    cause: validationResult.error,
                });
            }

            const query = RequestToQueryMapper.toGetUserByEmailQuery(validationResult.data);
            const result = await this.useCase.execute(query);

            const response = ResultToResponseMapper.toGetUserResponse(result);
            return ApiResponseBuilder.ok(response);
        } catch (error) {
            return ErrorHandler.handle(error);
        }
    }
}
