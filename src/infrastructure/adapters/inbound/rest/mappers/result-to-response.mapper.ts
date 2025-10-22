import type {
    RegisterUserResult,
    AuthenticateUserResult,
    CompleteNewPasswordChallengeResult,
    RefreshTokensResult,
} from '../../../../../application/use-cases/commands/index.js';
import type {
    GetUserByIdResult,
    GetUserByEmailResult,
    ListUsersResult,
} from '../../../../../application/use-cases/queries/index.js';
import type { DeactivateUserResult, UpdateUserResult } from '../../../../../application/use-cases/commands/index.js';
import type {
    RegisterUserResponse,
    AuthenticateUserResponse,
    CompleteNewPasswordChallengeResponse,
    RefreshTokensResponse,
    GetUserResponse,
    ListUsersResponse,
    DeactivateUserResponse,
    UpdateUserResponse,
} from '../dtos/responses/index.js';

export class ResultToResponseMapper {
    static toRegisterUserResponse(result: RegisterUserResult): RegisterUserResponse {
        return {
            id: result.id,
            email: result.email,
            fullName: result.fullName,
            status: result.status,
            externalAuthId: result.externalAuthId,
            createdAt: result.createdAt.toISOString(),
        };
    }

    static toUpdateUserResponse(result: UpdateUserResult): UpdateUserResponse {
        return {
            id: result.id,
            fullName: result.fullName,
            updatedAt: result.updatedAt.toISOString(),
        };
    }

    static toAuthenticateUserResponse(result: AuthenticateUserResult): AuthenticateUserResponse {
        return {
            challengeName: result.challengeName,
            session: result.session,
            accessToken: result.accessToken,
            idToken: result.idToken,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
        };
    }

    static toCompleteNewPasswordChallengeResponse(
        result: CompleteNewPasswordChallengeResult
    ): CompleteNewPasswordChallengeResponse {
        return {
            accessToken: result.accessToken,
            idToken: result.idToken,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
        };
    }

    static toRefreshTokensResponse(result: RefreshTokensResult): RefreshTokensResponse {
        return {
            accessToken: result.accessToken,
            idToken: result.idToken,
            expiresIn: result.expiresIn,
        };
    }

    static toGetUserResponse(result: GetUserByIdResult | GetUserByEmailResult): GetUserResponse {
        return {
            id: result.id,
            email: result.email,
            fullName: result.fullName,
            status: result.status,
            externalAuthId: result.externalAuthId,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
        };
    }

    static toListUsersResponse(result: ListUsersResult): ListUsersResponse {
        return {
            users: result.users.map(user => ({
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                status: user.status,
                createdAt: user.createdAt.toISOString(),
            })),
            pagination: result.pagination,
        };
    }

    static toDeactivateUserResponse(result: DeactivateUserResult): DeactivateUserResponse {
        return {
            id: result.id,
            status: result.status,
            updatedAt: result.updatedAt.toISOString(),
        };
    }
}
