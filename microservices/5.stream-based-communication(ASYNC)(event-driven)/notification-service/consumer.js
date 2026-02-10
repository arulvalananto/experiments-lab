import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'notification-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({
    groupId: 'notification-group',
});

async function start() {
    await consumer.connect();
    await consumer.subscribe({
        topic: 'order-events',
        fromBeginning: false,
    });

    console.log('[Notification Service] Listening for events');

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());

            if (event.eventType !== 'OrderCreated') return;

            const { orderId, userId } = event.payload;

            console.log(
                `[Notification Service] Notify user ${userId} for order ${orderId}`,
            );
        },
    });
}

start();
