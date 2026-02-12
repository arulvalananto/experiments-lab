const amqp = require('amqplib');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initDB() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS processed_events (
      event_id VARCHAR(255) PRIMARY KEY,
      processed_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function initDBWithRetry() {
    const RETRY_INTERVAL = 5000;

    while (true) {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS processed_events (
                    event_id VARCHAR(255) PRIMARY KEY,
                    processed_at TIMESTAMP DEFAULT NOW()
                );
            `);

            console.log('Payment DB Initialized');
            return;
        } catch (err) {
            console.log('Postgres not ready, retrying in 5 seconds...');
            await new Promise((res) => setTimeout(res, RETRY_INTERVAL));
        }
    }
}

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

async function start() {
    await initDBWithRetry();

    const connection = await connectWithRetry();
    const channel = await connection.createChannel();
    channel.prefetch(1);

    const exchange = 'order_events';
    const queue = 'payment_queue';

    // Main exchange
    await channel.assertExchange(exchange, 'fanout', { durable: true });

    // DLX exchange
    await channel.assertExchange('dlx', 'fanout', { durable: true });

    // Main queue with DLX configured
    await channel.assertQueue(queue, {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': 'dlx',
        },
    });

    // Bind main queue to order_events
    await channel.bindQueue(queue, exchange, '');

    // DLQ for failed messages
    await channel.assertQueue('payment_dlq', { durable: true });
    await channel.bindQueue('payment_dlq', 'dlx', '');

    console.log('Payment Service listening...');

    channel.consume(queue, async (msg) => {
        if (!msg) return;

        const event = JSON.parse(msg.content.toString());
        const eventId = event.orderId; // using orderId as eventId for idempotency
        console.log('Payment received event:', event);

        try {
            // 🔎 Check if already processed
            const existing = await pool.query(
                `SELECT 1 FROM processed_events WHERE event_id = $1`,
                [eventId],
            );

            if (existing.rows.length > 0) {
                console.log('Duplicate event skipped:', eventId);
                channel.ack(msg);
                return;
            }

            // Simulate payment processing
            await fakePaymentProcessing(event);

            // Mark as processed
            await pool.query(
                `INSERT INTO processed_events (event_id) VALUES ($1)`,
                [eventId],
            );

            channel.ack(msg);
            console.log('Payment processed for order:', event.orderId);
        } catch (err) {
            console.error('Payment failed:', err);

            // Requeue for retry
            channel.nack(msg, false, false); // no requeue (DLQ next)
        }
    });
}

async function fakePaymentProcessing(event) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate occasional failure
            if (Math.random() < 0.3) {
                reject(new Error('Random payment failure'));
            } else {
                resolve();
            }
        }, 1000);
    });
}

start();
