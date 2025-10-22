import type { GetUserByIdRequest, GetUserByEmailRequest, ListUsersRequest } from '../dtos/requests/index.js';

import type {
    GetUserByIdQuery,
    GetUserByEmailQuery,
    ListUsersQuery,
} from '../../../../../application/ports/inbound/queries/index.js';

export class RequestToQueryMapper {
    static toGetUserByIdQuery(request: GetUserByIdRequest): GetUserByIdQuery {
        return {
            userId: request.userId,
        };
    }

    static toGetUserByEmailQuery(request: GetUserByEmailRequest): GetUserByEmailQuery {
        return {
            email: request.email,
        };
    }

    static toListUsersQuery(request: ListUsersRequest): ListUsersQuery {
        return {
            status: request.status,
            page: request.page,
            limit: request.limit,
        };
    }
}
