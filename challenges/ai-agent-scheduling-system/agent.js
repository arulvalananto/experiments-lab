import axios from 'axios';
import { db } from './db.js';

export function getOllamaModel() {
    return process.env.OLLAMA_MODEL || 'llama2';
}

export async function runAgent(agent, input = {}) {
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
    } catch (err) {
        status = 'failed';
        error = err.message;
    }

    const finishedAt = new Date();
    const duration = finishedAt - startedAt;

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

// No module.exports, ES module exports used above
