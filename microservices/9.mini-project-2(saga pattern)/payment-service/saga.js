const amqp = require('amqplib');

let channel;

async function connectRabbit() {
    const conn = await amqp.connect('amqp://localhost');
    channel = await conn.createChannel();

    await channel.assertExchange('booking_exchange', 'topic', {
        durable: true,
    });
    await channel.assertQueue('payment_queue', { durable: true });

    await channel.bindQueue(
        'payment_queue',
        'booking_exchange',
        'booking.created',
    );

    channel.consume('payment_queue', async (msg) => {
        const event = JSON.parse(msg.content.toString());

        const success = Math.random() > 0.3; // simulate failure

        if (success) {
            console.log('Payment completed for bookingId:', event.bookingId);

            publish('payment.completed', {
                bookingId: event.bookingId,
            });
        } else {
            console.log('Payment failed for bookingId:', event.bookingId);

            publish('payment.failed', {
                bookingId: event.bookingId,
            });
        }

        channel.ack(msg);
    });
}

function publish(routingKey, message) {
    channel.publish(
        'booking_exchange',
        routingKey,
        Buffer.from(JSON.stringify(message)),
    );
}

module.exports = { connectRabbit };
