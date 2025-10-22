export interface GetUserByIdPortInput {
    userId: string;
}

export interface GetUserByEmailPortInput {
    email: string;
}

export interface ListUsersPortInput {
    status?: number;
    page: number;
    limit: number;
}

export interface UserFoundPortOutput {
    id: string;
    email: string;
    fullName: string;
    status: number;
    externalAuthId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UsersListPortOutput {
    users: UserFoundPortOutput[];
    total: number;
}

export interface UserReaderPort {
    findById(input: GetUserByIdPortInput): Promise<UserFoundPortOutput | null>;
    findByEmail(input: GetUserByEmailPortInput): Promise<UserFoundPortOutput | null>;
    findAll(input: ListUsersPortInput): Promise<UsersListPortOutput>;
}
