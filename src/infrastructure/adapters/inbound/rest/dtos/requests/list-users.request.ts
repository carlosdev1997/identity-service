import { z } from 'zod';

export const ListUsersRequestSchema = z.object({
    status: z.number().int().min(0).max(2).optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
});

export type ListUsersRequest = z.infer<typeof ListUsersRequestSchema>;
