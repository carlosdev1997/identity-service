export interface CreateAuthUserPortInput {
    email: string;
    fullName: string;
}

export interface AuthUserCreatedPortOutput {
    externalAuthId: string;
}

export interface AuthUserCreatorPort {
    create(input: CreateAuthUserPortInput): Promise<AuthUserCreatedPortOutput>;
}
