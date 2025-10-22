import type { APIGatewayProxyResult } from 'aws-lambda';
import {
    ApiResponseBuilder,
    ErrorHandler,
    InfrastructureException,
    ControllerBase,
    type AuthenticatedEvent,
} from '@companydev/shared-toolkit';
import { container } from '../../../../../di/index.js';
import { RefreshTokensUseCase } from '../../../../../../application/use-cases/commands/index.js';
import { RefreshTokensRequestSchema } from '../../dtos/requests/index.js';
import { RequestToCommandMapper, ResultToResponseMapper } from '../../mappers/index.js';

export class RefreshTokensController extends ControllerBase {
    private readonly useCase: RefreshTokensUseCase;

    constructor() {
        super();
        this.useCase = container.get(RefreshTokensUseCase);
    }

    protected async executeAuthenticated(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
        try {
            const { user } = event;
            console.log('Usuario autenticado:', { sub: user.sub, email: user.email });

            const body = this.parseBody(event.body);
            const validationResult = RefreshTokensRequestSchema.safeParse(body);

            if (!validationResult.success) {
                throw InfrastructureException.validation({
                    message: 'Error de validación en los datos enviados',
                    component: 'RefreshTokensController.executeAuthenticated',
                    cause: validationResult.error,
                });
            }

            const command = RequestToCommandMapper.toRefreshTokensCommand(validationResult.data);
            const result = await this.useCase.execute(command);

            const response = ResultToResponseMapper.toRefreshTokensResponse(result);
            return ApiResponseBuilder.ok(response);
        } catch (error) {
            return ErrorHandler.handle(error);
        }
    }
}
