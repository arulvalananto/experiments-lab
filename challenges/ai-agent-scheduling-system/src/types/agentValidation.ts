import { z } from 'zod';

export const agentSchema = z.object({
    name: z.string(),
    task: z.string(),
    system_prompt: z.string().optional(),
    cron: z.string(),
    email: z.string().optional(),
    enabled: z.boolean(),
    timeout: z.number().optional(),
    max_retries: z.number().optional(),
});
