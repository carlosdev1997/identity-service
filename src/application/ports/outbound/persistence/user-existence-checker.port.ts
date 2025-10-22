export interface CheckUserExistencePortInput {
    email: string;
}

export interface UserExistencePortOutput {
    exists: boolean;
}

export interface UserExistenceCheckerPort {
    check(input: CheckUserExistencePortInput): Promise<UserExistencePortOutput>;
}
