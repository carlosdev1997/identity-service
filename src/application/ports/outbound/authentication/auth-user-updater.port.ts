export interface UpdateAuthUserPortInput {
    externalAuthId: string;
    fullName?: string;
}

export interface AuthUserUpdatedPortOutput {
    success: boolean;
}

export interface AuthUserUpdaterPort {
    update(input: UpdateAuthUserPortInput): Promise<AuthUserUpdatedPortOutput>;
}
