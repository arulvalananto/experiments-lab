const amqp = require('amqplib');
const { pool } = require('./db');

async function startOutboxWorker() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    const exchange = 'order_events';
    await channel.assertExchange(exchange, 'fanout', { durable: true });

    console.log('Outbox worker started');

    setInterval(async () => {
        const { rows } = await pool.query(
            `SELECT * FROM outbox WHERE processed = false LIMIT 10`,
        );

        for (const event of rows) {
            try {
                channel.publish(
                    exchange,
                    '',
                    Buffer.from(JSON.stringify(event.payload)),
                    { persistent: true },
                );

                await pool.query(
                    `UPDATE outbox SET processed = true WHERE id = $1`,
                    [event.id],
                );

                console.log('Published event:', event.id);
            } catch (err) {
                console.error('Failed publishing:', err);
            }
        }
    }, 3000);
}

module.exports = startOutboxWorker;
