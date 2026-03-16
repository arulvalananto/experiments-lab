import { db } from './db.ts';
import type { Agent } from './types/agent.ts';
import { agentSchema } from './types/agentValidation.ts';
import { successResponse, errorResponse } from './types/response.ts';

export default async function (fastify: any, opts: any) {
    // List agents
    fastify.get('/agents', async (request: any, reply: any) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM agents',
                (err: Error | null, rows: Agent[]) => {
                    if (err) reply.code(500).send(errorResponse(err));
                    else reply.send(successResponse(rows));
                },
            );
        });
    });

    // Create agent
    fastify.post('/agents', async (request: any, reply: any) => {
        const parseResult = agentSchema.safeParse(request.body);
        if (!parseResult.success) {
            reply.code(400).send(errorResponse(parseResult.error.issues));
            return;
        }
        const {
            name,
            task,
            system_prompt,
            cron,
            email,
            enabled,
            timeout,
            max_retries,
        } = parseResult.data;
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO agents (name, task, system_prompt, cron, email, enabled, timeout, max_retries) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    task,
                    system_prompt,
                    cron,
                    email,
                    enabled,
                    timeout,
                    max_retries,
                ],
                function (err: Error | null) {
                    if (err) reply.code(500).send(errorResponse(err));
                    else reply.send(successResponse({ id: this.lastID }));
                },
            );
        });
    });

    // Edit agent
    fastify.put('/agents/:id', async (request: any, reply: any) => {
        const parseResult = agentSchema.safeParse(request.body);
        if (!parseResult.success) {
            reply.code(400).send(errorResponse(parseResult.error.issues));
            return;
        }
        const {
            name,
            task,
            system_prompt,
            cron,
            email,
            enabled,
            timeout,
            max_retries,
        } = parseResult.data;
        const { id } = request.params;
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE agents SET name = ?, task = ?, system_prompt = ?, cron = ?, email = ?, enabled = ?, timeout = ?, max_retries = ? WHERE id = ?`,
                [
                    name,
                    task,
                    system_prompt,
                    cron,
                    email,
                    enabled,
                    timeout,
                    max_retries,
                    id,
                ],
                function (err: Error | null) {
                    if (err) reply.code(500).send(errorResponse(err));
                    else reply.send(successResponse({ changes: this.changes }));
                },
            );
        });
    });

    // Delete agent
    fastify.delete('/agents/:id', async (request: any, reply: any) => {
        const { id } = request.params;
        if (!id) {
            reply.code(400).send(errorResponse('Agent id is required.'));
            return;
        }
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM agents WHERE id = ?',
                [id],
                function (err: Error | null) {
                    if (err) reply.code(500).send(errorResponse(err));
                    else reply.send(successResponse({ deleted: this.changes }));
                },
            );
        });
    });
}
