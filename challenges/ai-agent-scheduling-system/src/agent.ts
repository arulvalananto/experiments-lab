import axios from 'axios';
import { sendEmail } from './email.ts';
import type { Agent } from './types/agent.ts';
import { db } from './db.ts';

export function getOllamaModel(): string {
    return process.env.OLLAMA_MODEL || 'llama2';
}

export async function runAgent(
    agent: Agent,
    input: Record<string, any> = {},
): Promise<{
    agent_name: string;
    timestamp: string;
    status: string;
    response: string;
    error: string;
}> {
    const model = getOllamaModel();
    const prompt = agent.task;
    const systemPrompt = agent.system_prompt || '';
    const url = `http://localhost:11434/api/generate`;

    const body = {
        model,
        prompt,
        system: systemPrompt,
        ...input,
    };

    let status = 'success';
    let response = '';
    let error = '';
    const startedAt = new Date();

    try {
        const res = await axios.post(url, body, {
            headers: { 'Content-Type': 'application/json' },
        });
        response = res.data.response || '';
    } catch (err: any) {
        status = 'failed';
        error = err.message;
    }

    const finishedAt = new Date();
    const duration = finishedAt.getTime() - startedAt.getTime();

    // Save execution history
    db.run(
        `INSERT INTO executions (agent_id, status, response, error, started_at, finished_at, retries, duration)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            agent.id,
            status,
            response,
            error,
            startedAt.toISOString(),
            finishedAt.toISOString(),
            0,
            duration,
        ],
    );

    // Send email if successful and agent.email exists
    if (status === 'success' && agent.email) {
        try {
            await sendEmail(
                agent.email,
                `Agent '${agent.name}' Execution Result`,
                `<p>Task: ${agent.task}</p><p>Result: ${response}</p>`,
            );
            console.log(`Email sent to ${agent.email}`);
        } catch (emailErr) {
            console.error(`Failed to send email to ${agent.email}:`, emailErr);
        }
    }

    return {
        agent_name: agent.name,
        timestamp: startedAt.toISOString(),
        status,
        response,
        error,
    };
}
