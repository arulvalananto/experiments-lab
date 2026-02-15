const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis();

const queue = new Queue('subscription-events', {
    connection,
});

async function addToQueue(event) {
    await queue.add('process-event', event);
}

module.exports = { addToQueue };
