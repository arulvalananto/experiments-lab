import express from 'express';
import { Queue } from 'bullmq';

const app = express();
app.use(express.json());

const notificationQueue = new Queue('notifications', {
    connection: { host: 'localhost', port: 6379 },
});

app.post('/orders', async (req, res) => {
    const order = {
        id: Date.now(),
        item: req.body.item,
        userId: req.body.userId,
    };

    // Publish job (ASYNC)
    await notificationQueue.add('new-order', {
        orderId: order.id,
        userId: order.userId,
    });

    res.json({
        message: 'Order placed',
        order,
    });
});

app.listen(3000, () => {
    console.log('Order Service running on port 3000');
});
