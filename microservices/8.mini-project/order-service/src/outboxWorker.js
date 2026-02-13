const amqp = require('amqplib');
const { pool } = require('./db');
const { context, trace } = require('@opentelemetry/api');

async function connectWithRetry() {
    const RETRY_INTERVAL = 5000;

    while (true) {
        try {
            const connection = await amqp.connect('amqp://rabbitmq');
            console.log('Connected to RabbitMQ');
            return connection;
        } catch (err) {
            console.log('RabbitMQ not ready, retrying in 5 seconds...');
            await new Promise((res) => setTimeout(res, RETRY_INTERVAL));
        }
    }
}

async function startOutboxWorker() {
    const connection = await connectWithRetry();
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
                const span = trace
                    .getTracer('order-service')
                    .startSpan('publish-event');

                channel.publish(
                    exchange,
                    '',
                    Buffer.from(
                        JSON.stringify({ ...event.payload, eventId: event.id }),
                    ),
                    {
                        persistent: true,
                        headers: {
                            traceparent: span.spanContext().traceId,
                        },
                    },
                );

                span.end();

                // Mark as processed
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
