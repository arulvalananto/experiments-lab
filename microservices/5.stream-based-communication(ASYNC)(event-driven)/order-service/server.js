import express from 'express';
import { publishOrderCreated } from './producer.js';

const app = express();
app.use(express.json());

app.post('/orders', async (req, res) => {
    const order = {
        orderId: Date.now(),
        userId: req.body.userId,
    };

    await publishOrderCreated(order);

    res.json({ message: 'Order created', order });
});

app.listen(3000, () => console.log('Order Service running on port 3000'));
