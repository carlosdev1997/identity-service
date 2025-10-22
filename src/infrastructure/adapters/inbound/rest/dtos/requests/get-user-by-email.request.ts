import { z } from 'zod';

export const GetUserByEmailRequestSchema = z.object({
    email: z.string().email('Email inválido'),
});

export type GetUserByEmailRequest = z.infer<typeof GetUserByEmailRequestSchema>;
