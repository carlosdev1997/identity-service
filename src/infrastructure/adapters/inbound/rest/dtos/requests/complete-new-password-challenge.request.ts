import { z } from 'zod';

export const CompleteNewPasswordChallengeRequestSchema = z.object({
    email: z.string().email('Email inválido'),
    newPassword: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
    session: z.string().min(1, 'Session requerida'),
});

export type CompleteNewPasswordChallengeRequest = z.infer<typeof CompleteNewPasswordChallengeRequestSchema>;
