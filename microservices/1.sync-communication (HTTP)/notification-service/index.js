import express from 'express';

const app = express();
app.use(express.json());

app.post('/notify', (req, res) => {
    const { orderId, userId } = req.body;

    console.log(`Sending notification for order ${orderId} to user ${userId}`);

    res.json({ status: 'sent' });
});

app.listen(4000, () => {
    console.log('Notification Service running on port 4000');
});
