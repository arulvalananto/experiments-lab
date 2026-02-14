const amqp = require('amqplib');

async function connectRabbit() {
    const conn = await amqp.connect('amqp://localhost');
    const channel = await conn.createChannel();

    await channel.assertExchange('booking_exchange', 'topic', {
        durable: true,
    });
    await channel.assertQueue('notification_queue', { durable: true });

    await channel.bindQueue(
        'notification_queue',
        'booking_exchange',
        'booking.*',
    );

    channel.consume('notification_queue', async (msg) => {
        const event = JSON.parse(msg.content.toString());

        console.log('Sending notification for event:', msg.fields.routingKey);

        channel.ack(msg);
    });
}

module.exports = { connectRabbit };
