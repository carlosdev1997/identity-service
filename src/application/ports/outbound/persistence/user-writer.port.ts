export interface CreateUserPortInput {
    id: string;
    email: string;
    fullName: string;
    status: number;
    externalAuthId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateUserPortInput {
    id: string;
    fullName: string;
    status: number;
    updatedAt: Date;
}

export interface UserWrittenPortOutput {
    id: string;
    email: string;
    fullName: string;
    status: number;
    externalAuthId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWriterPort {
    create(input: CreateUserPortInput): Promise<UserWrittenPortOutput>;
    update(input: UpdateUserPortInput): Promise<UserWrittenPortOutput>;
}
