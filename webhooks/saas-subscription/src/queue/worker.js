const { Worker } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis();

const worker = new Worker(
    'subscription-events',
    async (job) => {
        const event = job.data;

        if (event.type === 'checkout.session.completed') {
            await activateSubscription(event.data.object);
        }
    },
    { connection },
);

async function activateSubscription(session) {
    console.log('Activating subscription for:', session.customer_email);

    // Update DB
    // Send welcome email
    // Log audit trail
}

worker.on('completed', (job) => {
    console.log(`Job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
    console.error(`Job failed: ${job.id}`, err);
});
