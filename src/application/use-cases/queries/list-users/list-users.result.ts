export interface ListUsersResult {
    users: Array<{
        id: string;
        email: string;
        fullName: string;
        status: string;
        createdAt: Date;
    }>;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
