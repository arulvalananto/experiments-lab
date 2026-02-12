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
    const queue = 'payment_queue';

    await channel.assertExchange(exchange, 'fanout', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, '');

    console.log('Payment Service listening...');

    channel.consume(queue, async (msg) => {
        if (!msg) return;

        const event = JSON.parse(msg.content.toString());
        console.log('Payment received event:', event);

        try {
            // Simulate payment processing
            await fakePaymentProcessing(event);

            channel.ack(msg);
            console.log('Payment processed for order:', event.orderId);
        } catch (err) {
            console.error('Payment failed:', err);

            // Requeue for retry
            channel.nack(msg, false, true);
        }
    });
}

async function fakePaymentProcessing(event) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate occasional failure
            if (Math.random() < 0.2) {
                reject(new Error('Random payment failure'));
            } else {
                resolve();
            }
        }, 1000);
    });
}

start();
