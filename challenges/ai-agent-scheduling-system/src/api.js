import { db } from './db.js';

export default async function (fastify, opts) {
    // List agents
    fastify.get('/agents', async (request, reply) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM agents', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    });

    // Create agent
    fastify.post('/agents', async (request, reply) => {
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
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                },
            );
        });
    });

    // Edit agent
    fastify.put('/agents/:id', async (request, reply) => {
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
                `UPDATE agents SET name=?, task=?, system_prompt=?, cron=?, email=?, enabled=?, timeout=?, max_retries=? WHERE id=?`,
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
                function (err) {
                    if (err) reject(err);
                    else resolve({ updated: this.changes });
                },
            );
        });
    });

    // Delete agent
    fastify.delete('/agents/:id', async (request, reply) => {
        const { id } = request.params;
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM agents WHERE id=?`, [id], function (err) {
                if (err) reject(err);
                else resolve({ deleted: this.changes });
            });
        });
    });

    // Get agent execution history
    fastify.get('/agents/:id/history', async (request, reply) => {
        const { id } = request.params;
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM executions WHERE agent_id=? ORDER BY started_at DESC LIMIT 100`,
                [id],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                },
            );
        });
    });
}
