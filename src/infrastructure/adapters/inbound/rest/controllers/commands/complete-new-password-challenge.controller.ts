import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ApiResponseBuilder, ErrorHandler, InfrastructureException, ControllerBase } from '@companydev/shared-toolkit';
import { container } from '../../../../../di/index.js';
import { CompleteNewPasswordChallengeUseCase } from '../../../../../../application/use-cases/commands/index.js';
import { CompleteNewPasswordChallengeRequestSchema } from '../../dtos/requests/index.js';
import { RequestToCommandMapper, ResultToResponseMapper } from '../../mappers/index.js';

export class CompleteNewPasswordChallengeController extends ControllerBase {
    private readonly useCase: CompleteNewPasswordChallengeUseCase;

    constructor() {
        super();
        this.useCase = container.get(CompleteNewPasswordChallengeUseCase);
    }

    protected async executePublic(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        try {
            const body = this.parseBody(event.body);
            const validationResult = CompleteNewPasswordChallengeRequestSchema.safeParse(body);

            if (!validationResult.success) {
                throw InfrastructureException.validation({
                    message: 'Error de validación en los datos enviados',
                    component: 'CompleteNewPasswordChallengeController.executePublic',
                    cause: validationResult.error,
                });
            }

            const command = RequestToCommandMapper.toCompleteNewPasswordChallengeCommand(validationResult.data);
            const result = await this.useCase.execute(command);

            const response = ResultToResponseMapper.toCompleteNewPasswordChallengeResponse(result);
            return ApiResponseBuilder.ok(response);
        } catch (error) {
            return ErrorHandler.handle(error);
        }
    }
}
