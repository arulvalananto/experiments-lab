require('./tracing');

const express = require('express');
const pool = require('./db');
const { connectRabbit, publish } = require('./saga');
const { v4: uuid } = require('uuid');

const app = express();
app.use(express.json());

app.post('/bookings', async (req, res) => {
    const id = uuid();

    await pool.query(
        'INSERT INTO bookings(id, amount, status) VALUES($1, $2, $3)',
        [id, req.body.amount, 'PENDING'],
    );

    await publish('booking.created', {
        bookingId: id,
        amount: req.body.amount,
    });

    res.json({ bookingId: id, status: 'PENDING' });
});

async function start() {
    // ✅ Create tables if not exist
    await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id UUID PRIMARY KEY,
            amount INT,
            status TEXT
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS outbox (
            id UUID PRIMARY KEY,
            event_type TEXT,
            payload JSONB,
            processed BOOLEAN DEFAULT FALSE
        );
    `);

    await connectRabbit();

    app.listen(3000, () => console.log('Booking Service running'));
}

start().catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
});
