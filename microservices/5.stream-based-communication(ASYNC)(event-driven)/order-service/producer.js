import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();

export async function publishOrderCreated(order) {
    await producer.connect();

    const event = {
        eventType: 'OrderCreated',
        eventId: crypto.randomUUID(),
        occurredAt: new Date().toISOString(),
        payload: order,
    };

    await producer.send({
        topic: 'order-events',
        messages: [
            {
                key: String(order.orderId),
                value: JSON.stringify(event),
            },
        ],
    });

    console.log('[Order Service] Event published:', event);
}
