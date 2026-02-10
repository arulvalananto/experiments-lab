import express from 'express';
import { sendNotification } from './client.js';

const app = express();
app.use(express.json());

app.post('/orders', async (req, res) => {
    const order = {
        id: Date.now(),
        userId: req.body.userId,
    };

    await sendNotification(order.id, order.userId);

    res.json({ message: 'Order placed', order });
});

app.listen(3000, () => {
    console.log('Order Service running on port 3000');
});
