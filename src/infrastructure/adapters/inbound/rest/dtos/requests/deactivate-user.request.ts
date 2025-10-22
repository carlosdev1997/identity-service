import { z } from 'zod';

export const DeactivateUserRequestSchema = z.object({
    userId: z.string().uuid('ID de usuario inválido'),
});

export type DeactivateUserRequest = z.infer<typeof DeactivateUserRequestSchema>;
