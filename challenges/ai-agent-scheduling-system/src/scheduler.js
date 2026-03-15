import cron from 'node-cron';

import { db } from './db.js';
import { runAgent } from './agent.js';

export function start() {
    db.all('SELECT * FROM agents WHERE enabled = 1', (err, agents) => {
        if (err) return;
        agents.forEach((agent) => {
            cron.schedule(agent.cron, async () => {
                await runAgent(agent);
            });
        });
    });
}
