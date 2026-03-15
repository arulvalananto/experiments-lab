const fetch = require('node-fetch');
const { db } = require('./db');

function getOllamaModel() {
    return process.env.OLLAMA_MODEL || 'llama2';
}

async function runAgent(agent, input = {}) {
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
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        response = data.response || '';
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

module.exports = {
    runAgent,
    getOllamaModel,
};
