export interface AuthenticateUserResponse {
    challengeName?: string;
    session?: string;
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresIn?: number;
}
