export interface AuthenticateUserResult {
    challengeName?: string;
    session?: string;
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresIn?: number;
}
