export interface CheckAuthUserExistencePortInput {
    email?: string;
    externalAuthId?: string;
}

export interface AuthUserExistencePortOutput {
    exists: boolean;
}

export interface AuthUserExistenceCheckerPort {
    check(input: CheckAuthUserExistencePortInput): Promise<AuthUserExistencePortOutput>;
}
