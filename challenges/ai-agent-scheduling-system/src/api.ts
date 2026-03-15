import { db } from './db.ts';
import type { Agent } from '../types/agent.ts';

export default async function (fastify: any, opts: any) {
    // List agents
    fastify.get('/agents', async (request: any, reply: any) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM agents',
                (err: Error | null, rows: Agent[]) => {
                    if (err) reject(err);
                    else resolve(rows);
                },
            );
        });
    });

    // Create agent
    fastify.post('/agents', async (request: any, reply: any) => {
        const {
            name,
            task,
            system_prompt,
            cron,
            email,
            enabled,
            timeout,
            max_retries,
        } = request.body;
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
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                },
            );
        });
    });

    // Edit agent
    fastify.put('/agents/:id', async (request: any, reply: any) => {
        const {
            name,
            task,
            system_prompt,
            cron,
            email,
            enabled,
            timeout,
            max_retries,
        } = request.body;
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
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                },
            );
        });
    });
}
