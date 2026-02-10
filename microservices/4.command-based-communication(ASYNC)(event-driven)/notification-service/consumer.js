import amqp from 'amqplib';

const QUEUE = 'send_notification_command';

async function start() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });
    channel.prefetch(1); // one message at a time

    console.log('[Notification Service] Waiting for commands...');

    channel.consume(QUEUE, async (msg) => {
        if (!msg) return;

        const command = JSON.parse(msg.content.toString());

        try {
            console.log(
                `[Notification Service] Sending notification for order ${command.orderId}`,
            );

            // simulate work
            await new Promise((r) => setTimeout(r, 500));

            channel.ack(msg); // success
        } catch (err) {
            console.error('Failed, retrying...');
            channel.nack(msg, false, true); // retry
        }
    });
}

start();
