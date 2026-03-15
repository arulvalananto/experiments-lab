const cron = require('node-cron');
const { db } = require('./db');
const { runAgent } = require('./agent');

function start() {
    db.all('SELECT * FROM agents WHERE enabled = 1', (err, agents) => {
        if (err) return;
        agents.forEach((agent) => {
            cron.schedule(agent.cron, async () => {
                await runAgent(agent);
            });
        });
    });
}

module.exports = {
    start,
};
