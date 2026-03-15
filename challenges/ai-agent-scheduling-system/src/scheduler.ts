import cron from 'node-cron';

import { db } from './db.ts';
import { runAgent } from './agent.ts';
import type { Agent } from './types/agent.ts';

export function start(): void {
    db.all(
        'SELECT * FROM agents WHERE enabled = 1',
        (err: Error | null, agents: Agent[]) => {
            if (err) return;
            agents.forEach((agent: Agent) => {
                cron.schedule(agent.cron, async () => {
                    await runAgent(agent);
                });
            });
        },
    );
}
