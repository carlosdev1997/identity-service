import { z } from 'zod';

export const RegisterUserRequestSchema = z.object({
    email: z.string().email('Email inválido'),
    fullName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
});

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;
