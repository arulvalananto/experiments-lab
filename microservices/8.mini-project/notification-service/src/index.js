const amqp = require('amqplib');

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
    const connection = await connectWithRetry();
    const channel = await connection.createChannel();

    // -----------------------------
    // Exchanges
    // -----------------------------
    const mainExchange = 'order_events';
    const retryExchange = 'notification_retry_exchange';
    const dlxExchange = 'notification_dlx';

    await channel.assertExchange(mainExchange, 'fanout', { durable: true });
    await channel.assertExchange(retryExchange, 'direct', { durable: true });
    await channel.assertExchange(dlxExchange, 'fanout', { durable: true });

    // -----------------------------
    // Queues
    // -----------------------------
    const queue = 'notification_queue';
    const dlq = 'notification_dlq';

    await channel.assertQueue(queue, { durable: true });
    await channel.assertQueue(dlq, { durable: true });

    // Bind main flow
    await channel.bindQueue(queue, mainExchange, '');

    // Bind retry flow (direct routing)
    await channel.bindQueue(queue, retryExchange, 'notification_retry');

    // Bind DLQ
    await channel.bindQueue(dlq, dlxExchange, '');

    console.log('Notification Service listening...');

    channel.consume(queue, async (msg) => {
        if (!msg) return;

        const event = JSON.parse(msg.content.toString());
        const headers = msg.properties.headers || {};
        const retryCount = headers['x-retry-count'] || 0;

        console.log(
            `Processing notification for order ${event.orderId}, retry: ${retryCount}`,
        );

        try {
            await fakeSendNotification(event);

            channel.ack(msg);
            console.log('Notification sent for order:', event.orderId);
        } catch (err) {
            console.error('Notification failed:', err.message);

            if (retryCount < 3) {
                // 🔁 Republish to retry exchange
                channel.publish(
                    retryExchange,
                    'notification_retry',
                    Buffer.from(JSON.stringify(event)),
                    {
                        persistent: true,
                        headers: {
                            'x-retry-count': retryCount + 1,
                        },
                    },
                );

                console.log(
                    `Retrying notification ${event.orderId} (${retryCount + 1})`,
                );

                channel.ack(msg); // ✅ ACK original message
            } else {
                // 💀 Send to DLQ
                channel.publish(
                    dlxExchange,
                    '',
                    Buffer.from(JSON.stringify(event)),
                    { persistent: true },
                );

                console.log(`Moved notification ${event.orderId} to DLQ`);

                channel.ack(msg); // ✅ ACK original message
            }
        }
    });
}

async function fakeSendNotification(event) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // simulate occasional failure
            if (Math.random() < 0.3) {
                reject(new Error('Random notification failure'));
            } else {
                resolve();
            }
        }, 500);
    });
}

start();
