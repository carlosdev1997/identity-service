export interface GetUserByEmailResult {
    id: string;
    email: string;
    fullName: string;
    status: string;
    externalAuthId: string;
    createdAt: Date;
    updatedAt: Date;
}
