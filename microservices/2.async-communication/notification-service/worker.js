import { Worker } from 'bullmq';

new Worker(
    'notifications',
    async (job) => {
        if (job.name === 'new-order') {
            const { orderId, userId } = job.data;

            console.log(
                `Sending notification for order ${orderId} to user ${userId}`,
            );
        }

        console.log(`Processed job ${job.name} with data:`, job.data);
    },
    {
        connection: { host: 'localhost', port: 6379 },
    },
);
