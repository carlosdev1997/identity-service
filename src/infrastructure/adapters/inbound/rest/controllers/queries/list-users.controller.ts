import type { APIGatewayProxyResult } from 'aws-lambda';
import {
    ApiResponseBuilder,
    ErrorHandler,
    InfrastructureException,
    ControllerBase,
    type AuthenticatedEvent,
} from '@companydev/shared-toolkit';
import { container } from '../../../../../di/index.js';
import { ListUsersUseCase } from '../../../../../../application/use-cases/queries/index.js';
import { ListUsersRequestSchema } from '../../dtos/requests/index.js';
import { RequestToQueryMapper, ResultToResponseMapper } from '../../mappers/index.js';

export class ListUsersController extends ControllerBase {
    private readonly useCase: ListUsersUseCase;

    constructor() {
        super();
        this.useCase = container.get(ListUsersUseCase);
    }

    protected async executeAuthenticated(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
        try {
            const { user } = event;
            console.log('Usuario autenticado:', { sub: user.sub, email: user.email });

            const queryParams = this.parseQueryParameters(event.queryStringParameters ?? {});
            const validationResult = ListUsersRequestSchema.safeParse(queryParams);

            if (!validationResult.success) {
                throw InfrastructureException.validation({
                    message: 'Los parámetros de consulta no son válidos',
                    component: 'ListUsersController.executeAuthenticated',
                    cause: validationResult.error,
                });
            }

            const query = RequestToQueryMapper.toListUsersQuery(validationResult.data);
            const result = await this.useCase.execute(query);

            const response = ResultToResponseMapper.toListUsersResponse(result);
            return ApiResponseBuilder.ok(response);
        } catch (error) {
            return ErrorHandler.handle(error);
        }
    }

    private parseQueryParameters(queryParams: Record<string, string | undefined>): {
        status?: number;
        page?: number;
        limit?: number;
    } {
        return {
            status: queryParams.status ? parseInt(queryParams.status, 10) : undefined,
            page: queryParams.page ? parseInt(queryParams.page, 10) : undefined,
            limit: queryParams.limit ? parseInt(queryParams.limit, 10) : undefined,
        };
    }
}
