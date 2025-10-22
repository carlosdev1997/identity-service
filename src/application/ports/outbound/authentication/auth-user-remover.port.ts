export interface RemoveAuthUserPortInput {
    externalAuthId: string;
}

export interface AuthUserRemovedPortOutput {
    success: boolean;
}

export interface AuthUserRemoverPort {
    remove(input: RemoveAuthUserPortInput): Promise<AuthUserRemovedPortOutput>;
}
