import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'analytics-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({
    groupId: 'analytics-group',
});

async function start() {
    await consumer.connect();
    await consumer.subscribe({
        topic: 'order-events',
        fromBeginning: true,
    });

    console.log('[Analytics Service] Listening for events');

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());

            if (event.eventType !== 'OrderCreated') return;

            console.log(
                `[Analytics Service] Tracking order ${event.payload.orderId}`,
            );
        },
    });
}

start();
