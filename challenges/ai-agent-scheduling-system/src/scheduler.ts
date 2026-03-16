import cron from 'node-cron';

import { db } from './db.ts';
import { runAgent } from './agent.ts';
import type { Agent } from './types/agent.ts';

export function start(): void {
    db.all(
        'SELECT * FROM agents WHERE enabled = 1',
        (err: Error | null, agents: Agent[]) => {
            if (err) {
                console.error('Error fetching agents:', err);
                return;
            }
            agents.forEach((agent: Agent) => {
                console.log(
                    `Scheduling agent '${agent.name}' with cron '${agent.cron}'`,
                );
                cron.schedule(agent.cron, async () => {
                    console.log(
                        `Running agent '${agent.name}' at ${new Date().toISOString()}`,
                    );
                    await runAgent(agent);
                });
            });
        },
    );
}
