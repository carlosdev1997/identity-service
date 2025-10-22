export interface AuthenticateUserPortInput {
    email: string;
    password: string;
}

export interface UserAuthenticatedPortOutput {
    challengeName?: string;
    session?: string;
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface CompleteNewPasswordChallengePortInput {
    email: string;
    newPassword: string;
    session: string;
}

export interface RefreshTokensPortInput {
    refreshToken: string;
}

export interface AuthUserAuthenticatorPort {
    authenticate(input: AuthenticateUserPortInput): Promise<UserAuthenticatedPortOutput>;
    completeNewPasswordChallenge(input: CompleteNewPasswordChallengePortInput): Promise<UserAuthenticatedPortOutput>;
    refreshTokens(input: RefreshTokensPortInput): Promise<UserAuthenticatedPortOutput>;
}
