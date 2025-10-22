import type {
    RegisterUserCommand,
    ActivateUserCommand,
    DeactivateUserCommand,
    AuthenticateUserCommand,
    CompleteNewPasswordChallengeCommand,
    RefreshTokensCommand,
    UpdateUserCommand,
} from '../../../../../application/ports/inbound/commands/index.js';

import type {
    RegisterUserRequest,
    AuthenticateUserRequest,
    CompleteNewPasswordChallengeRequest,
    RefreshTokensRequest,
    DeactivateUserRequest,
    UpdateUserRequest,
} from '../dtos/requests/index.js';

export class RequestToCommandMapper {
    static toRegisterUserCommand(request: RegisterUserRequest): RegisterUserCommand {
        return {
            email: request.email,
            fullName: request.fullName,
        };
    }

    static toUpdateUserCommand(userId: string, request: UpdateUserRequest): UpdateUserCommand {
        return {
            userId,
            fullName: request.fullName,
        };
    }

    static toActivateUserCommand(userId: string): ActivateUserCommand {
        return { userId };
    }

    static toDeactivateUserCommand(request: DeactivateUserRequest): DeactivateUserCommand {
        return {
            userId: request.userId,
        };
    }

    static toAuthenticateUserCommand(request: AuthenticateUserRequest): AuthenticateUserCommand {
        return {
            email: request.email,
            password: request.password,
        };
    }

    static toCompleteNewPasswordChallengeCommand(
        request: CompleteNewPasswordChallengeRequest
    ): CompleteNewPasswordChallengeCommand {
        return {
            email: request.email,
            newPassword: request.newPassword,
            session: request.session,
        };
    }

    static toRefreshTokensCommand(request: RefreshTokensRequest): RefreshTokensCommand {
        return {
            refreshToken: request.refreshToken,
        };
    }
}
