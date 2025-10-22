import { z } from 'zod';

export const RefreshTokensRequestSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token requerido'),
});

export type RefreshTokensRequest = z.infer<typeof RefreshTokensRequestSchema>;
