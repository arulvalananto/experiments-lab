import axios from 'axios';
import { db } from './db.js';
import { Agent } from '../types/agent';

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

    return {
        agent_name: agent.name,
        timestamp: startedAt.toISOString(),
        status,
        response,
        error,
    };
}
