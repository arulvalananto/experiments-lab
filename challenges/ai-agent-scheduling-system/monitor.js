const { db } = require('./db');

module.exports = async function (fastify, opts) {
    fastify.get('/status', async (request, reply) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM agents', (err, agents) => {
                if (err) return reject(err);
                db.all('SELECT * FROM executions', (err2, executions) => {
                    if (err2) return reject(err2);
                    const enabledAgents = agents.filter(
                        (a) => a.enabled,
                    ).length;
                    const totalExecutions = executions.length;
                    const successExecutions = executions.filter(
                        (e) => e.status === 'success',
                    ).length;
                    const avgDuration = executions.length
                        ? Math.round(
                              executions.reduce(
                                  (sum, e) => sum + (e.duration || 0),
                                  0,
                              ) / executions.length,
                          )
                        : 0;
                    // Find unhealthy agents
                    const unhealthy = agents.filter((agent) => {
                        const lastThree = executions
                            .filter((e) => e.agent_id === agent.id)
                            .slice(0, 3);
                        return (
                            lastThree.length === 3 &&
                            lastThree.every((e) => e.status === 'failed')
                        );
                    });
                    resolve({
                        registered_agents: agents.length,
                        enabled_agents: enabledAgents,
                        upcoming_runs: agents.map((a) => ({
                            name: a.name,
                            cron: a.cron,
                            enabled: !!a.enabled,
                        })),
                        stats: {
                            total_executions: totalExecutions,
                            success_rate: totalExecutions
                                ? successExecutions / totalExecutions
                                : 0,
                            avg_duration_ms: avgDuration,
                        },
                        unhealthy_agents: unhealthy.map((a) => a.name),
                    });
                });
            });
        });
    });
};
