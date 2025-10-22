import { z } from 'zod';

export const UpdateUserRequestSchema = z.object({
    fullName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
