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

    const exchange = 'order_events';
    const queue = 'notification_queue';

    await channel.assertExchange(exchange, 'fanout', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, '');

    console.log('Notification Service listening...');

    channel.consume(queue, async (msg) => {
        if (!msg) return;

        const event = JSON.parse(msg.content.toString());
        const headers = msg.properties.headers || {};
        const retryCount = headers['x-retry-count'] || 0;

        console.log(`Processing order ${event.orderId}, retry: ${retryCount}`);

        try {
            await fakeSendNotification(event);

            channel.ack(msg);
            console.log('Notification sent for order:', event.orderId);
        } catch (err) {
            console.error('Notification failed:', err);

            if (retryCount < 3) {
                channel.publish(
                    exchange,
                    '',
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

                channel.ack(msg); // ✅ ACK original
            } else {
                console.log(
                    `Sending notification for order ${event.orderId} to DLQ`,
                );

                // Send to DLQ exchange
                channel.publish('dlx', '', Buffer.from(JSON.stringify(event)), {
                    persistent: true,
                });

                channel.ack(msg);
            }

            channel.nack(msg, false, true);
        }
    });
}

async function fakeSendNotification(event) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 500);
    });
}

start();
