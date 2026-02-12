const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

async function start() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
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
