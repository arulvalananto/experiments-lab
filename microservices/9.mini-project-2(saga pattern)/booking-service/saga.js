const amqp = require('amqplib');
const pool = require('./db');

let channel;

async function connectRabbit() {
    const conn = await amqp.connect('amqp://localhost');
    channel = await conn.createChannel();

    await channel.assertExchange('booking_exchange', 'topic', {
        durable: true,
    });
    await channel.assertQueue('booking_queue', { durable: true });

    await channel.bindQueue('booking_queue', 'booking_exchange', 'payment.*');

    channel.consume('booking_queue', async (msg) => {
        const event = JSON.parse(msg.content.toString());

        if (msg.fields.routingKey === 'payment.completed') {
            await pool.query('UPDATE bookings SET status=$1 WHERE id=$2', [
                'CONFIRMED',
                event.bookingId,
            ]);

            console.log(
                'Payment completed, booking confirmed for bookingId:',
                event.bookingId,
            );

            publish('booking.confirmed', event);
        }

        if (msg.fields.routingKey === 'payment.failed') {
            await pool.query('UPDATE bookings SET status=$1 WHERE id=$2', [
                'CANCELLED',
                event.bookingId,
            ]);

            console.log(
                'Payment failed, booking cancelled for bookingId:',
                event.bookingId,
            );

            publish('booking.cancelled', event);
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

module.exports = { connectRabbit, publish };
