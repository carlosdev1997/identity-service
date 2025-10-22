import { z } from 'zod';

export const GetUserByIdRequestSchema = z.object({
    userId: z.string().uuid('ID de usuario inválido'),
});

export type GetUserByIdRequest = z.infer<typeof GetUserByIdRequestSchema>;
