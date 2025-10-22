import { z } from 'zod';

export const AuthenticateUserRequestSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Contraseña requerida'),
});

export type AuthenticateUserRequest = z.infer<typeof AuthenticateUserRequestSchema>;
