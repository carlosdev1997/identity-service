export interface ListUsersResponse {
    users: Array<{
        id: string;
        email: string;
        fullName: string;
        status: string;
        createdAt: string;
    }>;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
