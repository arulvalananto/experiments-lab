const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('./db');

const router = express.Router();

router.post('/orders', async (req, res) => {
    const { userId, amount } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const orderId = uuidv4();
        const eventId = uuidv4();

        // Insert order
        await client.query(
            `INSERT INTO orders (id, user_id, amount, status)
       VALUES ($1, $2, $3, $4)`,
            [orderId, userId, amount, 'CREATED'],
        );

        // Insert event into outbox
        await client.query(
            `INSERT INTO outbox (id, event_type, payload)
       VALUES ($1, $2, $3)`,
            [
                eventId,
                'OrderCreated',
                JSON.stringify({ orderId, userId, amount }),
            ],
        );

        await client.query('COMMIT');

        res.status(201).json({ orderId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Failed to create order');
    } finally {
        client.release();
    }
});

module.exports = router;
