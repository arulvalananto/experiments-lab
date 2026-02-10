import amqp from 'amqplib';

const QUEUE = 'send_notification_command';

export async function sendNotificationCommand(payload) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });

    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
    });

    console.log('[Order Service] Command sent:', payload);

    await channel.close();
    await connection.close();
}
