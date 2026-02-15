const stripe = require('stripe')(process.env.STRIPE_SECRET);
const { addToQueue } = require('../queue/queue');

module.exports = async function (fastify) {
    fastify.post('/webhook', async (request, reply) => {
        const signature = request.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                request.body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET,
            );
        } catch (err) {
            fastify.log.error('Invalid signature');
            return reply.status(400).send('Webhook Error');
        }

        // Idempotency check
        const eventId = event.id;
        const alreadyProcessed = await fakeDBCheck(eventId);

        if (alreadyProcessed) {
            return reply.status(200).send();
        }

        await saveEventId(eventId);

        // Push to queue
        await addToQueue(event);

        reply.status(200).send();
    });
};

// Mock DB
const processedEvents = new Set();

async function fakeDBCheck(id) {
    return processedEvents.has(id);
}

async function saveEventId(id) {
    processedEvents.add(id);
}
